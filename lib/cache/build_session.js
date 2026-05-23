import fs from 'fs'
import os from 'os'
import path from 'path'

const isBuildLifecycle =
  process.env.npm_lifecycle_event === 'build' ||
  process.env.npm_lifecycle_event === 'export' ||
  process.env.BUILD_MODE === 'true' ||
  process.env.EXPORT === 'true'

const isReadOnlyServerlessRuntime =
  !isBuildLifecycle &&
  (process.cwd().startsWith('/var/task') ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.NETLIFY === 'true')

const NOTION_CACHE_ROOT = isReadOnlyServerlessRuntime
  ? path.join(os.tmpdir(), 'notionnext-cache', 'notion')
  : path.join(process.cwd(), '.next', 'cache', 'notion')
const BUILD_SESSION_FILE = path.join(NOTION_CACHE_ROOT, 'build-session.json')

function sanitizeSessionId(sessionId) {
  return String(sessionId || 'default').replace(/[^a-z0-9_-]/gi, '_')
}

export function getNotionCacheRoot() {
  fs.mkdirSync(NOTION_CACHE_ROOT, { recursive: true })
  return NOTION_CACHE_ROOT
}

export function getBuildSessionId() {
  try {
    const raw = fs.readFileSync(BUILD_SESSION_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (parsed?.sessionId) {
      return sanitizeSessionId(parsed.sessionId)
    }
  } catch {}

  return sanitizeSessionId(process.env.npm_lifecycle_event || 'runtime')
}

export function getBuildSessionPath(...parts) {
  return path.join(getNotionCacheRoot(), 'sessions', getBuildSessionId(), ...parts)
}
