import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PlusCircle, Receipt, Users } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useGroupStore } from "../store/groupStore";

interface Member {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  created_at: string;
  payer: Member;
  participants: Member[];
}

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface SupabaseExpense {
  id: string;
  description: string;
  amount: number;
  created_at: string;
  payer: { id: string; name: string }[];
  participants: { member: { id: string; name: string } }[];
}

export default function GroupPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [settlements, setSettlements] = useState<Settlement[]>([]);

  const {
    groupName,
    members,
    expenses,
    setGroupName,
    setMembers,
    setExpenses,
  } = useGroupStore();

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        // Fetch group details
        const { data: groupData, error: groupError } = await supabase
          .from("groups")
          .select("name")
          .eq("id", groupId)
          .single();

        if (groupError) throw groupError;
        setGroupName(groupData.name);

        // Fetch members
        const { data: membersData, error: membersError } = await supabase
          .from("members")
          .select("id, name")
          .eq("group_id", groupId);

        if (membersError) throw membersError;
        setMembers(membersData);

        // Fetch expenses with participants
        const { data: expensesData, error: expensesError } = await supabase
          .from("expenses")
          .select(
            `
            id,
            description,
            amount,
            created_at,
            payer:payer_id(id, name),
            participants:expense_participants(member:members(id, name))
          `
          )
          .eq("group_id", groupId)
          .order("created_at", { ascending: false });

        if (expensesError) throw expensesError;

        // デバッグ用のログを詳細に
        console.log("Fetched expenses raw:", expensesData);
        console.log(
          "Fetched expenses payer check:",
          expensesData.map((e) => e.payer)
        );

        const formattedExpenses = (expensesData as unknown as SupabaseExpense[])
          // フィルタリング条件を緩和
          .filter((expense) => {
            console.log("Checking expense:", expense);
            console.log("Payer:", expense.payer);
            return expense.payer != null; // 単純にnullチェックのみに
          })
          .map((expense) => ({
            id: expense.id,
            description: expense.description,
            amount: expense.amount,
            created_at: expense.created_at,
            payer: expense.payer[0] || expense.payer, // 配列でない場合も考慮
            participants: expense.participants.map((p) => p.member),
          }));

        // デバッグ用
        console.log("Formatted expenses:", formattedExpenses);

        setExpenses(formattedExpenses);
        calculateSettlements(formattedExpenses, membersData);
      } catch (err) {
        setError("データの取得に失敗しました");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [groupId, setGroupName, setMembers, setExpenses]);

  const calculateSettlements = (expenses: Expense[], members: Member[]) => {
    // Calculate net balance for each member
    const balances: { [key: string]: number } = {};
    members.forEach((member) => {
      balances[member.id] = 0;
    });

    expenses.forEach((expense) => {
      if (!expense.payer) return;

      const payerId = expense.payer.id;
      const amount = expense.amount;
      const participantCount = expense.participants.length;
      const sharePerPerson = amount / participantCount;

      // Add full amount to payer's balance
      balances[payerId] += amount;

      // Subtract each participant's share
      expense.participants.forEach((participant) => {
        balances[participant.id] -= sharePerPerson;
      });
    });

    // Calculate settlements
    const settlements: Settlement[] = [];
    const memberIds = Object.keys(balances);

    while (memberIds.length > 1) {
      const maxCreditorId = memberIds.reduce((a, b) =>
        balances[a] > balances[b] ? a : b
      );
      const maxDebtorId = memberIds.reduce((a, b) =>
        balances[a] < balances[b] ? a : b
      );

      if (
        Math.abs(balances[maxCreditorId]) < 0.01 &&
        Math.abs(balances[maxDebtorId]) < 0.01
      ) {
        break;
      }

      const amount = Math.min(
        balances[maxCreditorId],
        Math.abs(balances[maxDebtorId])
      );

      const creditor = members.find((m) => m.id === maxCreditorId);
      const debtor = members.find((m) => m.id === maxDebtorId);

      if (creditor && debtor && amount > 0) {
        settlements.push({
          from: debtor.name,
          to: creditor.name,
          amount: Math.ceil(amount),
        });

        balances[maxCreditorId] -= amount;
        balances[maxDebtorId] += amount;
      }

      if (Math.abs(balances[maxCreditorId]) < 0.01) {
        memberIds.splice(memberIds.indexOf(maxCreditorId), 1);
      }
      if (Math.abs(balances[maxDebtorId]) < 0.01) {
        memberIds.splice(memberIds.indexOf(maxDebtorId), 1);
      }
    }

    setSettlements(settlements);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ad0c4]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{groupName}</h1>
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-1" />
                <span>{members.map((m) => m.name).join(", ")}</span>
              </div>
            </div>
            <button
              onClick={() => navigate(`/group/${groupId}/add-expense`)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3ad0c4] hover:bg-[#19b5ab] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              支出を追加
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expenses List */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">支出一覧</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {expenses.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  支出はまだありません
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {expenses.map((expense) => (
                    <li key={expense.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Receipt className="h-5 w-5 text-gray-400" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {expense.description}
                            </p>
                            <p className="text-sm text-gray-500">
                              支払い: {expense.payer.name}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            ¥{expense.amount.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(expense.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">
                          対象:{" "}
                          {expense.participants.map((p) => p.name).join(", ")}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Settlements */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">精算方法</h2>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              {settlements.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  精算は必要ありません
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {settlements.map((settlement, index) => (
                    <li key={index} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">
                              {settlement.from}
                            </span>
                            <span className="mx-2">→</span>
                            <span className="font-medium">{settlement.to}</span>
                          </p>
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          ¥{settlement.amount.toLocaleString()}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
