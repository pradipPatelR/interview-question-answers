import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { QuestionAnswersList } from './QuestionAnswersList';

export const TopicDetail = (props) => {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [newCategoryName, setNewCategoryName] = useState("");
  const isAdmin = props.session?.user?.user_metadata?.provider_type === 'admin';

  const fetchTopicAndCategories = useCallback(async () => {
    const { data: topicData } = await supabase.from('topics').select('*').eq('id', topicId).single();
    if (topicData) setTopic(topicData);

    const { data: catData } = await supabase.from('categories').select('*').eq('topic_id', topicId).order('name');
    if (catData) {
      setCategories(catData);
      if (catData.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(catData[0].id);
        props.onCategorySelect(catData[0].id);
      }
    }
  }, [topicId, selectedCategoryId, props]);

  useEffect(() => {
    fetchTopicAndCategories();
  }, [fetchTopicAndCategories]);

  const handleSelectCategory = (catId) => {
    setSelectedCategoryId(catId);
    props.onCategorySelect(catId);
    setIsDropdownOpen(false);
    setCategorySearch("");
  };

  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const handleCreateOrUpdateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    if (editingCategoryId) {
      const { error } = await supabase.from('categories').update({ name: newCategoryName.trim() }).eq('id', editingCategoryId);
      if (!error) {
        setNewCategoryName("");
        setEditingCategoryId(null);
        document.getElementById('closeCategoryModal').click();
        fetchTopicAndCategories();
      } else {
        alert(error.message);
      }
    } else {
      const { error } = await supabase.from('categories').insert([{ topic_id: topicId, name: newCategoryName.trim() }]);
      if (!error) {
        setNewCategoryName("");
        document.getElementById('closeCategoryModal').click();
        fetchTopicAndCategories();
      } else {
        alert(error.message);
      }
    }
  };

  const openCreateCategory = () => {
    setEditingCategoryId(null);
    setNewCategoryName("");
  };

  const openEditCategory = () => {
    setEditingCategoryId(selectedCategoryId);
    setNewCategoryName(selectedCategoryName);
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  const selectedCategoryName = categories.find(c => c.id === selectedCategoryId)?.name || "Select category...";

  if (!topic) return <div className="text-center mt-5"><span className="spinner-border"></span></div>;

  return (
    <div className="container mt-4 mb-5 pb-5">
      <Link to="/questions" className="text-decoration-none text-muted mb-3 d-inline-block">
        <i className="fa fa-arrow-left me-2"></i>Back to Topics
      </Link>
      
      <div className="d-flex justify-content-between align-items-end mb-4 border-bottom pb-3">
        <div>
          <h2 className="mb-0 fw-bold">{topic.name}</h2>
          <div className="mt-3 position-relative" style={{ minWidth: '250px' }}>
            <label className="form-label small text-muted fw-bold">Select category</label>
            <div className="dropdown">
              <button 
                className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center bg-body-tertiary" 
                type="button" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{selectedCategoryName}</span>
                <i className="fa fa-chevron-down ms-2"></i>
              </button>
              
              {isDropdownOpen && (
                <div className="dropdown-menu show w-100 p-0 shadow mt-1" style={{ position: 'absolute', zIndex: 1050 }}>
                  <div className="p-2 border-bottom">
                    <input 
                      type="text" 
                      className="form-control form-control-sm" 
                      placeholder="Search category..." 
                      value={categorySearch} 
                      onChange={(e) => setCategorySearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {filteredCategories.length === 0 ? (
                      <div className="dropdown-item text-muted small">No categories found</div>
                    ) : (
                      filteredCategories.map(cat => (
                        <button 
                          key={cat.id} 
                          className={`dropdown-item d-flex justify-content-between align-items-center ${selectedCategoryId === cat.id ? 'active' : ''}`} 
                          onClick={() => handleSelectCategory(cat.id)}
                        >
                          <span>{cat.name}</span>
                          {isAdmin && cat.created_at && (
                            <small className="ms-2 opacity-75" style={{ fontSize: '0.65rem', whiteSpace: 'nowrap' }}>
                              {new Date(cat.created_at).toLocaleString('en-US', {
                                month: '2-digit', day: '2-digit', year: 'numeric',
                                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                              })}
                            </small>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {isAdmin && (() => {
              const selCat = categories.find(c => c.id === selectedCategoryId);
              return selCat?.created_at ? (
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                  Created: {new Date(selCat.created_at).toLocaleString('en-US', {
                    month: '2-digit', day: '2-digit', year: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                  })}
                </small>
              ) : null;
            })()}
          </div>
        </div>
        
        {isAdmin && (
          <div className="d-flex gap-2">
            {selectedCategoryId && (
              <button className="btn btn-outline-secondary btn-sm fw-bold" data-bs-toggle="modal" data-bs-target="#createCategoryModal" onClick={openEditCategory}>
                <i className="fa fa-pencil me-2"></i>Edit
              </button>
            )}
            <button className="btn btn-success btn-sm fw-bold" data-bs-toggle="modal" data-bs-target="#createCategoryModal" onClick={openCreateCategory}>
              <i className="fa fa-plus me-2"></i>Add Category
            </button>
          </div>
        )}
      </div>

      {selectedCategoryId ? (
        <QuestionAnswersList {...props} />
      ) : (
        <div className="text-center text-muted mt-5">Please select or create a category.</div>
      )}

      {/* Admin Create/Edit Category Modal */}
      {isAdmin && (
        <div className="modal fade" id="createCategoryModal" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editingCategoryId ? `Edit Category` : `Create Category for ${topic.name}`}</h5>
                <button type="button" className="btn-close" id="closeCategoryModal" data-bs-dismiss="modal"></button>
              </div>
              <form onSubmit={handleCreateOrUpdateCategory}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Category Name</label>
                    <input type="text" className="form-control" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} placeholder="e.g. Swift" required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={!newCategoryName.trim()}>{editingCategoryId ? 'Update' : 'Save'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};