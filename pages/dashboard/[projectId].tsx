import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

interface UserProject {
  id: string
  userId: string
  templateId: string | null
  workspaceId: string
  workspaceName: string
  categoryDbId?: string
  contentDbId?: string
  status: 'template_copied' | 'databases_extracted' | 'website_building' | 'deployed' | 'error'
  createdAt: string
  updatedAt: string
  siteUrl?: string
  repoUrl?: string
  error?: string
}

const ProjectDashboard: React.FC = () => {
  const router = useRouter()
  const { projectId } = router.query
  const [project, setProject] = useState<UserProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [building, setBuilding] = useState(false)

  useEffect(() => {
    if (projectId && typeof projectId === 'string') {
      fetchProject(projectId)
    }
  }, [projectId])

  const fetchProject = async (id: string) => {
    try {
      const response = await fetch(`/api/project/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProject(data)
      } else {
        setError('Project not found')
      }
    } catch (err) {
      setError('Failed to fetch project')
    } finally {
      setLoading(false)
    }
  }

  const startBuild = async () => {
    if (!project || building) return

    setBuilding(true)
    try {
      const response = await fetch('/api/build/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ projectId: project.id })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Build started:', data)
        // Refresh project data to get updated status
        await fetchProject(project.id)
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Failed to start build')
      }
    } catch (err) {
      setError('Failed to start build')
    } finally {
      setBuilding(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'template_copied':
        return 'bg-blue-100 text-blue-800'
      case 'databases_extracted':
        return 'bg-yellow-100 text-yellow-800'
      case 'website_building':
        return 'bg-purple-100 text-purple-800'
      case 'deployed':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'template_copied':
        return 'Template Copied'
      case 'databases_extracted':
        return 'Databases Extracted'
      case 'website_building':
        return 'Building Website'
      case 'deployed':
        return 'Deployed'
      case 'error':
        return 'Error'
      default:
        return status
    }
  }

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'template_copied':
        return 25
      case 'databases_extracted':
        return 50
      case 'website_building':
        return 75
      case 'deployed':
        return 100
      case 'error':
        return 0
      default:
        return 0
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || 'Project not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Project Dashboard - NodeSite.Today</title>
        <meta name="description" content="Your website is being built" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Project Dashboard
            </h1>

            {/* Project Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Project ID</h3>
                <p className="text-sm text-gray-900">{project.id}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Workspace</h3>
                <p className="text-sm text-gray-900">{project.workspaceName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created</h3>
                <p className="text-sm text-gray-900">
                  {new Date(project.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="text-sm text-gray-900">
                  {new Date(project.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900">Status</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage(project.status)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {getProgressPercentage(project.status)}% complete
              </p>
            </div>

            {/* Database Info */}
            {(project.categoryDbId || project.contentDbId) && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Database Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">Category Database</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.categoryDbId ? `✅ Connected (${project.categoryDbId})` : '❌ Not found'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">Content Database</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {project.contentDbId ? `✅ Connected (${project.contentDbId})` : '❌ Not found'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {project.status === 'deployed' && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Website is Ready!</h3>
                <div className="space-y-4">
                  {project.siteUrl && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900">Live Website</h4>
                      <a
                        href={project.siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-800 underline"
                      >
                        {project.siteUrl}
                      </a>
                    </div>
                  )}
                  {project.repoUrl && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900">Source Code</h4>
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {project.repoUrl}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {project.status === 'error' && project.error && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-red-900 mb-4">Error</h3>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-red-800">{project.error}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => fetchProject(project.id)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh Status
              </button>
              
              {project.status === 'databases_extracted' && (
                <button
                  onClick={startBuild}
                  disabled={building}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {building ? 'Starting Build...' : 'Start Website Build'}
                </button>
              )}
              
              {project.status === 'deployed' && project.siteUrl && (
                <a
                  href={project.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  View Website
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProjectDashboard