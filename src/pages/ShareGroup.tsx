import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Copy, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGroupStore } from '../store/groupStore';
import logoImage from '/images/logo_warippy.png';

export default function ShareGroup() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const setGroupName = useGroupStore((state) => state.setGroupName);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const { data, error } = await supabase
          .from('groups')
          .select('name')
          .eq('id', groupId)
          .single();

        if (error) throw error;
        if (data) {
          setGroupName(data.name);
        }
      } catch (err) {
        setError('グループの取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [groupId, setGroupName]);

  const shareUrl = `${window.location.origin}/group/${groupId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('URLのコピーに失敗しました:', err);
    }
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
        <div className="flex items-center justify-center">
          <img src={logoImage} alt="Warippyロゴ" />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 -mt-10 mb-8">
          グループを共有
        </h2>
        
        <div className="space-y-6">
          <p className="text-sm text-gray-600 text-center">
            以下のURLをメンバーに共有して、グループに参加してもらいましょう。
          </p>

          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 p-2 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              <button
                onClick={handleCopy}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
            {copied && (
              <p className="mt-2 text-sm text-green-600">URLをコピーしました！</p>
            )}
          </div>

          <button
            onClick={() => navigate(`/group/${groupId}`)}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3ad0c4] hover:bg-[#19b5ab] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span>グループページへ</span>
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}