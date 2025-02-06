import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateGroup from './pages/CreateGroup';
import ShareGroup from './pages/ShareGroup';
import GroupPage from './pages/GroupPage';
import AddExpense from './pages/AddExpense';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<CreateGroup />} />
          <Route path="/share/:groupId" element={<ShareGroup />} />
          <Route path="/group/:groupId" element={<GroupPage />} />
          <Route path="/group/:groupId/add-expense" element={<AddExpense />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;