'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'

interface Bookmark {
  id: string;
  title: string;
  url: string;
  created_at: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  const fetchBookmarks = useCallback(async () => {
    try {
      const { data, error: err } = await supabase.from('bookmarks').select('*').order('created_at', { ascending: false })
      if (err) throw err
      if (data) setBookmarks(data as Bookmark[])
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err)
      setError('Failed to load bookmarks')
    }
  }, [supabase])

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user: authUser }, error: err } = await supabase.auth.getUser()
        if (err) throw err
        if (!authUser) router.push('/')
        else {
          setUser(authUser)
          await fetchBookmarks()
        }
      } catch (err) {
        console.error('Auth error:', err)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }
    checkUser()
  }, [supabase, router, fetchBookmarks])

  const addBookmark = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError('')
    setSuccess('')
    
    try {
      if (!title.trim() || !url.trim()) {
        setError('Title and URL are required')
        return
      }
      
      const { error: err } = await supabase.from('bookmarks').insert([{ title, url, user_id: user.id }])
      if (err) throw err
      
      setTitle('')
      setUrl('')
      setSuccess('Bookmark added!')
      setTimeout(() => setSuccess(''), 3000)
      await fetchBookmarks()
    } catch (err) {
      console.error('Insert error:', err)
      setError('Failed to add bookmark')
    }
  }

  const deleteBookmark = async (id: string) => {
    setDeleting(id)
    try {
      const { error: err } = await supabase.from('bookmarks').delete().eq('id', id)
      if (err) throw err
      setSuccess('Bookmark deleted')
      setTimeout(() => setSuccess(''), 2000)
      await fetchBookmarks()
    } catch (err) {
      console.error('Delete error:', err)
      setError('Failed to delete bookmark')
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
  // ... existing checkUser logic ...

  // Create a broadcast-only channel (No Database Replication required!)
  const channel = supabase.channel('dashboard-sync')
    .on('broadcast', { event: 'sync' }, () => {
      console.log('Received broadcast sync signal');
      fetchBookmarks(); // Refresh the list
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [supabase, fetchBookmarks]);

  if (loading) return <div className="vh-100 d-flex justify-content-center align-items-center">Loading Garner...</div>
  if (!user) return <div className="vh-100 d-flex justify-content-center align-items-center">Redirecting...</div>

  return (
    <div className="container py-5">
      <header className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="h3 fw-bold text-primary mb-0">Garner</h1>
        <small className="text-muted">{user.email}</small>
        <button onClick={() => supabase.auth.signOut().then(() => router.push('/'))} className="btn btn-outline-danger btn-sm">Logout</button>
      </header>

      {error && <div className="alert alert-danger alert-dismissible fade show" role="alert">
        {error}
        <button type="button" className="btn-close" onClick={() => setError('')}></button>
      </div>}
      
      {success && <div className="alert alert-success alert-dismissible fade show" role="alert">
        {success}
        <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
      </div>}

      <div className="card shadow-sm border-0 mb-4 p-4">
        <form onSubmit={addBookmark} className="row g-2">
          <div className="col-md-5">
            <input 
              type="text" 
              placeholder="Title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              className="form-control" 
              required 
            />
          </div>
          <div className="col-md-5">
            <input 
              type="url" 
              placeholder="URL" 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              className="form-control" 
              required 
            />
          </div>
          <div className="col-md-2 d-grid">
            <button type="submit" className="btn btn-primary fw-bold">Add</button>
          </div>
        </form>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center text-muted py-5">
          <p>No bookmarks yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="list-group">
          {bookmarks.map((b) => (
            <div key={b.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div className="text-truncate grow">
                <h6 className="mb-0 fw-bold">{b.title}</h6>
                <a href={b.url} target="_blank" rel="noopener noreferrer" className="text-muted d-block text-truncate small">
                  {b.url}
                </a>
              </div>
              <button 
                onClick={() => deleteBookmark(b.id)}
                disabled={deleting === b.id}
                className="btn btn-sm btn-outline-danger ms-2"
              >
                {deleting === b.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}