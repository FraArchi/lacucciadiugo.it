import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  MapPinIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  ShareIcon,
  PlusIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { groupsAPI } from '@/services/api';
import { useCommunityStore } from '@/store';
import { Button, Avatar, Card } from '@/components/common';
import toast from 'react-hot-toast';
import './Community.css';

const GroupDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { selectedGroup, selectGroup, posts, setPosts, setLoading, isLoading } = useCommunityStore();
  
  const [isMember, setIsMember] = useState(false);
  
  useEffect(() => {
    fetchGroup();
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);
  
  const fetchGroup = async () => {
    setLoading(true);
    try {
      const response = await groupsAPI.getOne(slug);
      selectGroup(response.data);
      setIsMember(response.data.isMember || false);
    } catch (err) {
      console.error('Failed to fetch group:', err);
      toast.error('Gruppo non trovato');
      navigate('/app/community');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchPosts = async () => {
    try {
      const response = await groupsAPI.getPosts(slug, { limit: 20 });
      setPosts(response.data.posts || response.data || []);
    } catch {
      setPosts([]);
    }
  };
  
  const handleJoin = async () => {
    try {
      if (isMember) {
        await groupsAPI.leave(slug);
        setIsMember(false);
        toast.success('Hai lasciato il gruppo');
      } else {
        await groupsAPI.join(slug);
        setIsMember(true);
        toast.success('Ti sei unito al gruppo!');
      }
    } catch {
      toast.error('Errore. Riprova.');
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Ora';
    if (diffHours < 24) return `${diffHours}h fa`;
    if (diffHours < 48) return 'Ieri';
    return date.toLocaleDateString('it-IT', { day: 'numeric', month: 'short' });
  };
  
  if (isLoading || !selectedGroup) {
    return (
      <div className="group-detail-page">
        <div className="skeleton" style={{ height: 240, borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-6)' }} />
        <div className="group-detail-grid">
          <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-xl)' }} />
          <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-xl)' }} />
        </div>
      </div>
    );
  }
  
  const group = selectedGroup;
  
  return (
    <div className="group-detail-page">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 'var(--space-4)' }}
      >
        <ArrowLeftIcon style={{ width: 20, height: 20, marginRight: 8 }} />
        Torna alla community
      </Button>
      
      {/* Hero */}
      <motion.div 
        className="group-hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <img 
          src={group.coverImage || 'https://via.placeholder.com/1200x240?text=🐕+Community'}
          alt={group.name}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/1200x240?text=🐕';
          }}
        />
        <div className="group-hero-overlay">
          <h1>{group.name}</h1>
          <p>
            <MapPinIcon style={{ width: 16, height: 16, display: 'inline', marginRight: 4 }} />
            {group.location || group.region || 'Italia'} • 
            <UserGroupIcon style={{ width: 16, height: 16, display: 'inline', margin: '0 4px' }} />
            {group.memberCount || 0} membri
          </p>
        </div>
      </motion.div>
      
      <div className="group-detail-grid">
        {/* Main Content - Posts Feed */}
        <div className="posts-feed">
          {/* New Post Card */}
          {isMember && (
            <Card className="post-card" padding="md">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <Avatar size="md" />
                <input
                  type="text"
                  placeholder="Condividi qualcosa con il gruppo..."
                  style={{
                    flex: 1,
                    padding: 'var(--space-3)',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--text-sm)',
                  }}
                />
                <Button size="sm" icon={<PlusIcon />}>Pubblica</Button>
              </div>
            </Card>
          )}
          
          {/* Posts */}
          {posts.length === 0 ? (
            <Card className="post-card" padding="lg" style={{ textAlign: 'center' }}>
              <span style={{ fontSize: '3rem' }}>📝</span>
              <h3 style={{ marginTop: 'var(--space-3)', fontFamily: 'var(--font-display)' }}>
                Nessun post ancora
              </h3>
              <p style={{ color: 'var(--gray-500)', marginTop: 'var(--space-2)' }}>
                {isMember ? 'Sii il primo a condividere qualcosa!' : 'Unisciti per vedere e creare post!'}
              </p>
            </Card>
          ) : (
            posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="post-card">
                  <div className="post-header">
                    <Avatar 
                      src={post.author?.avatar} 
                      name={post.author?.firstName || 'User'}
                      size="md"
                    />
                    <div className="post-author">
                      <h4>{post.author?.firstName} {post.author?.lastName?.[0]}.</h4>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="post-content">
                    {post.title && <h4 style={{ marginBottom: 'var(--space-2)' }}>{post.title}</h4>}
                    <p>{post.content || post.excerpt}</p>
                  </div>
                  
                  {post.coverImage && (
                    <div className="post-image">
                      <img src={post.coverImage} alt="" />
                    </div>
                  )}
                  
                  <div className="post-actions">
                    <span className="post-action">
                      <HeartIcon />
                      {post.likes?.length || 0}
                    </span>
                    <span className="post-action">
                      <ChatBubbleLeftIcon />
                      {post.comments?.length || 0}
                    </span>
                    <span className="post-action">
                      <ShareIcon />
                      Condividi
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
        
        {/* Sidebar */}
        <div className="group-sidebar">
          {/* About */}
          <Card className="sidebar-card">
            <h3>
              <UserGroupIcon />
              Info Gruppo
            </h3>
            {group.description && (
              <p style={{ color: 'var(--gray-600)', marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
                {group.description}
              </p>
            )}
            <Button 
              fullWidth 
              variant={isMember ? 'outline' : 'primary'}
              onClick={handleJoin}
            >
              {isMember ? 'Lascia gruppo' : 'Unisciti al gruppo'}
            </Button>
          </Card>
          
          {/* Members Preview */}
          <Card className="sidebar-card">
            <h3>
              <UserGroupIcon />
              Membri ({group.memberCount || 0})
            </h3>
            <div className="member-list">
              {(group.members || []).slice(0, 5).map((member) => (
                <div key={member.id || member.userId} className="member-item">
                  <Avatar 
                    src={member.user?.avatar || member.avatar}
                    name={member.user?.firstName || member.firstName || 'Membro'}
                    size="sm"
                  />
                  <div className="info">
                    <span className="name">
                      {member.user?.firstName || member.firstName} {(member.user?.lastName || member.lastName)?.[0]}.
                    </span>
                    {member.role && member.role !== 'MEMBER' && (
                      <span className="role">{member.role === 'ADMIN' ? 'Admin' : 'Moderatore'}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {(group.memberCount || 0) > 5 && (
              <Button variant="ghost" size="sm" fullWidth style={{ marginTop: 'var(--space-4)' }}>
                Vedi tutti i membri
              </Button>
            )}
          </Card>
          
          {/* Admin Actions */}
          {group.isAdmin && (
            <Card className="sidebar-card">
              <h3>
                <Cog6ToothIcon />
                Gestione
              </h3>
              <Button variant="outline" size="sm" fullWidth>
                Modifica gruppo
              </Button>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupDetail;
