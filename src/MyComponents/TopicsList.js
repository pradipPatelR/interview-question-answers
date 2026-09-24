import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export const TopicsList = ({ session }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicName, setTopicName] = useState("");
  const [topicImage, setTopicImage] = useState("");

  const isAdmin = session?.user?.user_metadata?.provider_type === 'admin';

  const fetchTopics = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('topics').select('*').order('name');
    if (!error) setTopics(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const [editingTopicId, setEditingTopicId] = useState(null);

  const handleCreateOrUpdateTopic = async (e) => {
    e.preventDefault();
    if (!topicName.trim()) return;
    
    if (editingTopicId) {
      const { error } = await supabase.from('topics').update({ name: topicName.trim(), image_url: topicImage.trim() }).eq('id', editingTopicId);
      if (!error) {
        setTopicName("");
        setTopicImage("");
        setEditingTopicId(null);
        document.getElementById('closeTopicModal').click();
        fetchTopics();
      } else {
        alert(error.message);
      }
    } else {
      const { error } = await supabase.from('topics').insert([{ name: topicName.trim(), image_url: topicImage.trim() }]);
      if (!error) {
        setTopicName("");
        setTopicImage("");
        document.getElementById('closeTopicModal').click();
        fetchTopics();
      } else {
        alert(error.message);
      }
    }
  };

  const openEditModal = (topic) => {
    setEditingTopicId(topic.id);
    setTopicName(topic.name);
    setTopicImage(topic.image_url || "");
  };

  const openCreateModal = () => {
    setEditingTopicId(null);
    setTopicName("");
    setTopicImage("");
  };

  if (loading) return <div className="text-center mt-5"><span className="spinner-border text-primary"></span></div>;

  return (
    <div className="container mt-4 mb-5 pb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 text-primary fw-bold">Interview Topics</h3>
        {isAdmin && (
          <button className="btn btn-primary btn-sm fw-bold" data-bs-toggle="modal" data-bs-target="#createTopicModal" onClick={openCreateModal}>
            <i className="fa fa-plus me-2"></i>Add Topic
          </button>
        )}
      </div>

      {topics.length === 0 ? (
        <p className="text-center text-muted">No topics available.</p>
      ) : (
        <div className="row row-cols-2 row-cols-md-4 g-4">
          {topics.map(topic => (
            <div className="col position-relative" key={topic.id}>
              {isAdmin && (
                <button 
                  className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 m-2" 
                  style={{ zIndex: 10 }}
                  onClick={(e) => {
                    e.preventDefault();
                    openEditModal(topic);
                  }}
                  data-bs-toggle="modal" 
                  data-bs-target="#createTopicModal"
                  title="Edit Topic"
                >
                  <i className="fa fa-pencil"></i>
                </button>
              )}
              <Link to={`/questions/${topic.id}`} className="text-decoration-none">
                <div className="card h-100 shadow-sm border-0 bg-body-tertiary text-center p-3 hover-shadow transition">
                  {topic.image_url ? (
                    <img src={topic.image_url} alt={topic.name} className="img-fluid mx-auto mb-3" style={{ height: '60px', objectFit: 'contain' }} />
                  ) : (
                    <i className="fa fa-folder-open fa-3x text-primary mb-3"></i>
                  )}
                  <h5 className="card-title text-body fw-bold">{topic.name}</h5>
                  {isAdmin && (topic.created_at || topic.updated_at) && (
                    <small className="text-muted d-block mt-2" style={{ fontSize: '0.7rem' }}>
                      {topic.created_at && `Created: ${new Date(topic.created_at).toLocaleString('en-US', {
                        month: '2-digit', day: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                      }).replace(',', '')}`}
                      {topic.updated_at && ` | Updated: ${new Date(topic.updated_at).toLocaleString('en-US', {
                        month: '2-digit', day: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                      }).replace(',', '')}`}
                    </small>
                  )}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Admin Create/Edit Topic Modal */}
      {isAdmin && (
        <div className="modal fade" id="createTopicModal" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editingTopicId ? 'Edit Topic' : 'Create Topic'}</h5>
                <button type="button" className="btn-close" id="closeTopicModal" data-bs-dismiss="modal"></button>
              </div>
              <form onSubmit={handleCreateOrUpdateTopic}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Topic Name</label>
                    <input type="text" className="form-control" value={topicName} onChange={e => setTopicName(e.target.value)} placeholder="e.g. iOS" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Topic Image URL (Optional)</label>
                    <input type="url" className="form-control" value={topicImage} onChange={e => setTopicImage(e.target.value)} placeholder="https://..." />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={!topicName.trim()}>{editingTopicId ? 'Update Topic' : 'Save Topic'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
