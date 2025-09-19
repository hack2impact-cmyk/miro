import React, { useState, useEffect, useCallback } from 'react';
import { getCommunityPosts } from '../services/geminiService';
import { ProfileIcon } from './icons';
import { useTranslation } from '../context/i18n';

interface CommunityPost {
    username: string;
    content: string;
}

interface CommunityViewProps {
  language: string;
}

const PostSkeleton: React.FC = () => (
    <div className="bg-white p-5 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-4 w-1/3 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
    </div>
);

const CommunityView: React.FC<CommunityViewProps> = ({ language }) => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();

    const fetchPosts = useCallback(async () => {
        setIsLoading(true);
        const fetchedPosts = await getCommunityPosts(language);
        setPosts(fetchedPosts);
        setIsLoading(false);
    }, [language]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    return (
        <div className="p-6 h-full overflow-y-auto space-y-6 bg-miro-base rounded-r-2xl">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-miro-text">{t('community.title')}</h2>
                <button
                    onClick={fetchPosts}
                    disabled={isLoading}
                    className="px-4 py-2 text-sm bg-miro-green-dark text-white font-bold rounded-full hover:bg-opacity-90 disabled:bg-gray-400 transition-colors"
                >
                    {isLoading ? t('community.refreshing') : t('community.refresh')}
                </button>
            </div>
            
            <div className="space-y-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => <PostSkeleton key={i} />)
                ) : posts.length > 0 ? (
                    posts.map((post, index) => (
                        <div
                          key={index}
                          className="bg-white p-5 rounded-2xl shadow-sm animate-slideInUp"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center space-x-3 mb-3">
                                <div className="p-2 bg-gray-100 rounded-full">
                                    <ProfileIcon className="w-5 h-5 text-miro-text-light" />
                                </div>
                                <p className="font-bold text-miro-text">{post.username}</p>
                            </div>
                            <p className="text-miro-text">{post.content}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-miro-text text-center">{t('community.empty')}</p>
                )}
            </div>
        </div>
    );
};

export default CommunityView;