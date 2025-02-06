import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useGroupStore } from "../store/groupStore";
import logoImage from "/images/logo_warippy.png";

export default function AddExpense() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { members } = useGroupStore();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState("");
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 初期表示時に全メンバーを選択
  React.useEffect(() => {
    setSelectedParticipants(members.map((m) => m.id));
  }, [members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (
        !description ||
        !amount ||
        !payerId ||
        selectedParticipants.length === 0
      ) {
        throw new Error("必須項目を入力してください");
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        throw new Error("有効な金額を入力してください");
      }

      // 1の位で切り上げ
      const roundedAmount = Math.ceil(numAmount);

      // Create expense
      const { data: expenseData, error: expenseError } = await supabase
        .from("expenses")
        .insert([
          {
            group_id: groupId,
            payer_id: payerId,
            description,
            amount: roundedAmount,
          },
        ])
        .select()
        .single();

      if (expenseError) throw expenseError;

      // Create expense participants
      const participantPromises = selectedParticipants.map((memberId) =>
        supabase.from("expense_participants").insert([
          {
            expense_id: expenseData.id,
            member_id: memberId,
          },
        ])
      );

      await Promise.all(participantPromises);

      navigate(`/group/${groupId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setIsSubmitting(false);
    }
  };

  const toggleParticipant = (memberId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="flex items-center justify-center mb-8">
          <img src={logoImage} alt="Warippyロゴ" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 -mt-10 mb-8">
          支出を追加
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              支払い内容
            </label>
            <input
              type="text"
              id="description"
              required
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700"
            >
              金額
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">¥</span>
              </div>
              <input
                type="number"
                id="amount"
                required
                min="0"
                step="0.01"
                className="pl-7 py-2 pr-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="payer"
              className="block text-sm font-medium text-gray-700"
            >
              支払った人
            </label>
            <select
              id="payer"
              required
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={payerId}
              onChange={(e) => setPayerId(e.target.value)}
            >
              <option value="">選択してください</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              対象メンバー
            </label>
            <div className="space-y-2">
              {members.map((member) => (
                <label key={member.id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    checked={selectedParticipants.includes(member.id)}
                    onChange={() => toggleParticipant(member.id)}
                  />
                  <span className="ml-2 text-sm text-gray-900">
                    {member.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          <div className="flex items-center justify-between space-x-4">
            <button
              type="button"
              onClick={() => navigate(`/group/${groupId}`)}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3ad0c4] hover:bg-[#19b5ab] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isSubmitting ? "登録中..." : "登録する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
