import React, { useState } from 'react';
import { Bell, User, Search, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../services/reportService';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const navigate = useNavigate();

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.length > 1) {
            setSearching(true);
            try {
                const response = await reportService.globalSearch(query);
                setSearchResults(response.data.results);
                setShowResults(true);
            } catch (error) {
                console.error('Search error:', error);
            } finally {
                setSearching(false);
            }
        } else {
            setShowResults(false);
            setSearchResults([]);
        }
    };

    const handleResultClick = (result) => {
        setShowResults(false);
        setSearchQuery('');
        if (result.entity_type === 'student') {
            navigate(`/student-report?studentId=${result.id}`);
        }
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder="Global search..."
                            className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                        
                        {showResults && (searchResults.students?.length > 0 || searchResults.courses?.length > 0 || searchResults.instructors?.length > 0) && (
                            <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                                {searchResults.students?.length > 0 && (
                                    <div className="p-2">
                                        <h4 className="text-xs font-semibold text-gray-500 px-3 pt-2">Students</h4>
                                        {searchResults.students.map((result) => (
                                            <button
                                                key={result.id}
                                                onClick={() => handleResultClick(result)}
                                                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                <p className="text-sm font-medium text-gray-900">{result.name}</p>
                                                <p className="text-xs text-gray-500">{result.additional_info}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {searchResults.courses?.length > 0 && (
                                    <div className="p-2 border-t">
                                        <h4 className="text-xs font-semibold text-gray-500 px-3 pt-2">Courses</h4>
                                        {searchResults.courses.map((result) => (
                                            <button
                                                key={result.id}
                                                onClick={() => handleResultClick(result)}
                                                className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                                            >
                                                <p className="text-sm font-medium text-gray-900">{result.name}</p>
                                                <p className="text-xs text-gray-500">{result.additional_info}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {searching && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <div className="spinner-sm"></div>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center space-x-4">
                    <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    </button>
                    <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                            <User size={18} className="text-white" />
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-semibold text-gray-700">{user.name || 'Admin User'}</p>
                            <p className="text-xs text-gray-500 capitalize">{user.role || 'Admin'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;