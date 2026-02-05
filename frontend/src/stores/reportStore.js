import { defineStore } from 'pinia'

import { ref } from 'vue'
import { api } from 'src/boot/axios'

export const useReportStore = defineStore('reports', () => {
  // Backend enums: must match FastAPI validation
  const ALLOWED_TYPES = ref(['realtime', 'cached'])
  const ALLOWED_INTERVALS = ref(['hourly', 'daily', 'monthly', 'annually'])
  const ALLOWED_STATUSES = ref(['active', 'inactive'])

  const CONNECTIONS = ref([
    'PostgreSQL_Main',
    'MySQL_Sales',
    'Oracle_ERP',
    'Redis_Cache',
    'Firebird_Legacy',
    'Snowflake_WH',
  ])

  const validateReport = (report) => {
    const isTypeValid = ALLOWED_TYPES.value.includes(report.type)
    const isIntervalValid = ALLOWED_INTERVALS.value.includes(report.interval)

    if (!isTypeValid) console.error(`Invalid Type: ${report.type}`)
    if (!isIntervalValid) console.error(`Invalid Interval: ${report.interval}`)

    return isTypeValid && isIntervalValid
  }

  // TABLE 1: Main Reports (The Parents)
  const table1 = ref([])

  // TABLE 2: Linked Detailed Reports
  const reportItems = ref([])

  const getItemsforReport = (reportId) => {
    return reportItems.value.filter((item) => item.report_id === parseInt(reportId))
  }

  const getReportById = (id) => {
    return table1.value.find((r) => r.id === parseInt(id))
  }

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w-]+/g, '') // Remove non-word chars (keep hyphen)
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start
      .replace(/-+$/, '') // Trim - from end
  }

  const updateReportTitle = (id, title) => {
    const report = table1.value.find((r) => r.id === id)
    if (!report) return

    report.title = title
    report.slug = slugify(title)
  }

  // Data now sourced from API via CRUD actions below

  const addReport = (newReport) => {
    // Create report via API and add returned object to store
    return api
      .post('/reports', newReport)
      .then((res) => {
        const r = res.data
        // Map backend response to frontend shape
        table1.value.unshift({
          id: r.id,
          title: r.title,
          description: r.description,
          slug: r.slug,
          type: r.type,
          interval: r.interval,
          status: r.status,
          parameters: r.params || {},
        })
        return r
      })
      .catch((err) => {
        console.error('Create report error', err)
        throw err
      })
  }

  const addItem = (reportId, newItem) => {
    // Create report column via API and add returned object to store
    const payload = {
      name: newItem.name || newItem.title,
      description: newItem.description || null,
      status: newItem.status,
      query: newItem.sql_query || newItem.query || null,
      connection_id: newItem.connection || newItem.connection_id,
    }

    return api
      .post(`/reports/${reportId}/columns`, payload)
      .then((res) => {
        const c = res.data
        reportItems.value.unshift({
          id: c.id,
          report_id: parseInt(reportId),
          title: c.name,
          name: c.name,
          description: c.description,
          status: c.status,
          sql_query: c.query,
          query: c.query,
          connection: c.connection_id,
          connection_id: c.connection_id,
        })
        return c
      })
      .catch((err) => {
        console.error('Create report column error', err)
        throw err
      })
  }

  // ============================================
  // TODO: CRUD - REPORTS
  // ============================================

  // TODO: CREATE REPORT (POST /reports)
  // Payload: { title, description?, type, interval, status, params? }
  // Constraints:
  //   - title: 3-255 chars, required
  //   - description: max 1000 chars, optional
  //   - type: enum ['realtime', 'cached'], required
  //   - interval: enum ['hourly', 'daily', 'monthly', 'annually'], required
  //   - status: enum ['active', 'inactive'], required
  //   - params: dict/object, optional
  // Response: { id, title, description, type, interval, status, slug, params, ... }
  // Store updates: add to table1 after success, update nextReportId
  // Error cases: validation error (400), unauthorized (401)

  // TODO: READ ALL REPORTS (GET /reports)
  // Params: filters?, pagination?
  // Response: array of report objects
  // Store updates: replace table1 with server data
  // Error cases: unauthorized (401), server error (500)

  // TODO: READ REPORT BY ID (GET /reports/{id})
  // Response: single report object with all fields
  // Store updates: optional (use in getReportById or fetch on demand)
  // Error cases: not found (404), unauthorized (401)

  // TODO: UPDATE REPORT (PUT /reports/{id})
  // Payload: { title?, description?, type?, interval?, status?, params? }
  // Note: all fields optional, slug is read-only (auto-generated)
  // Store updates: merge changes into table1 entry by id
  // Error cases: not found (404), validation (400), unauthorized (401)

  // TODO: DELETE REPORT (DELETE /reports/{id})
  // Side effect: must cascade-delete all associated report columns (reportItems)
  // Store updates: remove from table1 and reportItems by report_id
  // Error cases: not found (404), unauthorized (401)

  // ============================================
  // TODO: CRUD - REPORT COLUMNS
  // ============================================

  // TODO: CREATE COLUMN (POST /reports/{id}/columns)
  // Payload: { name, description?, status, query?, connection_id }
  // Constraints:
  //   - name: 3-255 chars, required
  //   - description: max 1000 chars, optional
  //   - status: enum ['active', 'inactive'], required
  //   - query: optional string (SQL)
  //   - connection_id: required string
  // Response: { id, name, description, status, query, connection_id }
  // Store updates: add to reportItems with new id, link to report_id
  // Error cases: report not found (404), validation (400), unauthorized (401)

  // TODO: READ COLUMNS FOR REPORT (GET /reports/{id}/columns)
  // Response: array of column objects for given report_id
  // Store updates: replace reportItems entries for that report_id
  // Error cases: report not found (404), unauthorized (401)

  // TODO: READ COLUMN BY ID (GET /reports/{id}/columns/{column_id})
  // Response: single column object
  // Store updates: optional
  // Error cases: not found (404), unauthorized (401)

  // TODO: UPDATE COLUMN (PUT /reports/{id}/columns/{column_id})
  // Payload: { name?, description?, status?, query?, connection_id? }
  // Note: all fields optional, id and report_id are read-only
  // Store updates: merge changes into reportItems entry by id
  // Error cases: not found (404), validation (400), unauthorized (401)

  // TODO: DELETE COLUMN (DELETE /reports/{id}/columns/{column_id})
  // Note: verify column_id belongs to report_id before delete
  // Store updates: remove from reportItems by id
  // Error cases: not found (404), unauthorized (401)

  // ============================================
  // READ - REPORTS
  // ============================================
  const fetchAllReports = () => {
    return api
      .get('/reports')
      .then((res) => {
        const reports = res.data || []
        table1.value = reports.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          slug: r.slug,
          type: r.type,
          interval: r.interval,
          status: r.status,
          parameters: r.params || {},
        }))
        return reports
      })
      .catch((err) => {
        console.error('Fetch reports error', err)
        throw err
      })
  }

  const fetchReportById = (reportId) => {
    return api
      .get(`/reports/${reportId}`)
      .then((res) => {
        const r = res.data
        console.log('ReportData:', r)
        const formattedReport = {
          id: r.id,
          title: r.title,
          description: r.description,
          slug: r.slug,
          type: r.type,
          interval: r.interval,
          status: r.status,
          parameters: r.params || {},
        }
        // Check if report exists in table1; if so, update it. If not, add it.
        const idx = table1.value.findIndex((report) => report.id === parseInt(reportId))
        if (idx >= 0) {
          table1.value[idx] = formattedReport
        } else {
          table1.value.push(formattedReport)
        }
        // ------------------------

        return formattedReport
      })
      .catch((err) => {
        console.error(`Fetch report ${reportId} error`, err)
        throw err
      })
  }

  // ============================================
  // UPDATE - REPORTS
  // ============================================
  const updateReport = (reportId, updates) => {
    return api
      .put(`/reports/${reportId}`, updates)
      .then((res) => {
        const r = res.data
        const idx = table1.value.findIndex((report) => report.id === reportId)
        if (idx >= 0) {
          table1.value[idx] = {
            id: r.id,
            title: r.title,
            description: r.description,
            slug: r.slug,
            type: r.type,
            interval: r.interval,
            status: r.status,
            parameters: r.params || {},
          }
        }
        return r
      })
      .catch((err) => {
        console.error(`Update report ${reportId} error`, err)
        throw err
      })
  }

  // ============================================
  // DELETE - REPORTS
  // ============================================
  const deleteReport = (id) => {
    return api
      .delete(`/reports/${id}`)
      .then(() => {
        table1.value = table1.value.filter((r) => r.id !== id)
        reportItems.value = reportItems.value.filter((item) => item.report_id !== id)
        return { message: 'Report deleted successfully' }
      })
      .catch((err) => {
        console.error(`Delete report ${id} error`, err)
        throw err
      })
  }

  // ============================================
  // READ - REPORT COLUMNS
  // ============================================
  const fetchColumnsForReport = (reportId) => {
    const rid = parseInt(reportId)
    return api
      .get(`/reports/${rid}/columns`)
      .then((res) => {
        const columns = res.data || []
        // Filter and update reportItems for this report
        reportItems.value = reportItems.value.filter((item) => item.report_id !== rid)
        const mapped = columns.map((c) => ({
          id: c.id,
          report_id: rid,
          title: c.name,
          name: c.name,
          description: c.description,
          status: c.status,
          sql_query: c.query,
          query: c.query,
          connection: c.connection_id,
          connection_id: c.connection_id,
        }))
        reportItems.value.push(...mapped)
        return columns
      })
      .catch((err) => {
        console.error(`Fetch columns for report ${rid} error`, err)
        throw err
      })
  }

  const fetchColumnById = (reportId, columnId) => {
    const rid = parseInt(reportId)
    return api
      .get(`/reports/${rid}/columns/${columnId}`)
      .then((res) => {
        const c = res.data
        return {
          id: c.id,
          report_id: rid,
          title: c.name,
          name: c.name,
          description: c.description,
          status: c.status,
          sql_query: c.query,
          query: c.query,
          connection: c.connection_id,
          connection_id: c.connection_id,
        }
      })
      .catch((err) => {
        console.error(`Fetch column ${rid}/${columnId} error`, err)
        throw err
      })
  }

  // ============================================
  // UPDATE - REPORT COLUMNS
  // ============================================
  const updateColumn = (reportId, columnId, updates) => {
    const rid = parseInt(reportId)
    const payload = {
      name: updates.name || updates.title || undefined,
      description: updates.description,
      status: updates.status,
      query: updates.query || updates.sql_query,
      connection_id: updates.connection_id || updates.connection,
    }
    // Remove undefined fields
    Object.keys(payload).forEach((key) => payload[key] === undefined && delete payload[key])

    return api
      .put(`/reports/${rid}/columns/${columnId}`, payload)
      .then((res) => {
        const c = res.data
        const idx = reportItems.value.findIndex((item) => item.id === columnId)
        if (idx >= 0) {
          reportItems.value[idx] = {
            id: c.id,
            report_id: rid,
            title: c.name,
            name: c.name,
            description: c.description,
            status: c.status,
            sql_query: c.query,
            query: c.query,
            connection: c.connection_id,
            connection_id: c.connection_id,
          }
        }
        return c
      })
      .catch((err) => {
        console.error(`Update column ${rid}/${columnId} error`, err)
        throw err
      })
  }

  // ============================================
  // DELETE - REPORT COLUMNS
  // ============================================
  const deleteColumn = (reportId, columnId) => {
    return api
      .delete(`/reports/${reportId}/columns/${columnId}`)
      .then(() => {
        reportItems.value = reportItems.value.filter((item) => item.id !== columnId)
        return { message: 'Column deleted successfully' }
      })
      .catch((err) => {
        console.error(`Delete column ${reportId}/${columnId} error`, err)
        throw err
      })
  }

  const deleteItem = (id) => {
    // Legacy local-only delete (no API call)
    reportItems.value = reportItems.value.filter((item) => item.id !== id)
  }

  return {
    table1,
    reportItems,

    ALLOWED_TYPES,
    ALLOWED_INTERVALS,
    ALLOWED_STATUSES,
    CONNECTIONS,

    slugify,

    validateReport,

    getItemsforReport,
    getReportById,
    updateReportTitle,

    addReport,
    addItem,
    fetchAllReports,
    fetchReportById,
    updateReport,
    deleteReport,
    fetchColumnsForReport,
    fetchColumnById,
    updateColumn,
    deleteColumn,
    deleteItem,
  }
})
