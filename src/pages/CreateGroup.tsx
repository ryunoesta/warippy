import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import logoImage from '/images/logo_warippy.png';

export default function CreateGroup() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleAddMember = () => {
    if (!memberName.trim()) return;
    if (members.includes(memberName)) {
      setError('メンバー名が重複しています');
      return;
    }
    setMembers([...members, memberName]);
    setMemberName('');
    setError('');
  };

  const handleRemoveMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (members.length < 2) {
      setError('メンバーは最低2名必要です');
      return;
    }

    try {
      // Create group
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert([{ name: groupName }])
        .select()
        .single();

      if (groupError) throw groupError;

      // Create members
      const memberPromises = members.map((name) =>
        supabase
          .from('members')
          .insert([{ group_id: groupData.id, name }])
          .select()
      );

      await Promise.all(memberPromises);

      navigate(`/share/${groupData.id}`);
    } catch (err) {
      setError('グループの作成に失敗しました');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="flex items-center justify-center">
          <img src={logoImage} alt="Warippyロゴ" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 -mt-10 mb-8">
          グループを作成
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700">
              グループ名
            </label>
            <input
              type="text"
              id="groupName"
              required
              className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="memberName" className="block text-sm font-medium text-gray-700">
              メンバー名
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="text"
                id="memberName"
                className="flex-1 p-2 rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="inline-flex items-center rounded-r-md bg-[#3ad0c4] px-3 text-white hover:bg-[#19b5ab] text-sm"
              >
                追加
              </button>
            </div>
          </div>

          {members.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">メンバー一覧</h3>
              <ul className="divide-y divide-gray-200">
                {members.map((member, index) => (
                  <li key={index} className="py-3 flex justify-between items-center">
                    <span className="text-sm text-gray-900">{member}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3ad0c4] hover:bg-[#19b5ab] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            グループを作成
          </button>
        </form>
      </div>
    </div>
  );
}