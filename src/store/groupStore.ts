import { create } from 'zustand';

interface Member {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  payer: Member;
  participants: Member[];
  created_at: string;
}

interface GroupStore {
  groupId: string | null;
  groupName: string;
  members: Member[];
  expenses: Expense[];
  setGroupId: (id: string) => void;
  setGroupName: (name: string) => void;
  setMembers: (members: Member[]) => void;
  addMember: (member: Member) => void;
  removeMember: (memberId: string) => void;
  setExpenses: (expenses: Expense[]) => void;
  addExpense: (expense: Expense) => void;
}

export const useGroupStore = create<GroupStore>((set) => ({
  groupId: null,
  groupName: '',
  members: [],
  expenses: [],
  setGroupId: (id) => set({ groupId: id }),
  setGroupName: (name) => set({ groupName: name }),
  setMembers: (members) => set({ members }),
  addMember: (member) => set((state) => ({ members: [...state.members, member] })),
  removeMember: (memberId) =>
    set((state) => ({
      members: state.members.filter((m) => m.id !== memberId),
    })),
  setExpenses: (expenses) => set({ expenses }),
  addExpense: (expense) =>
    set((state) => ({ expenses: [expense, ...state.expenses] })),
}));