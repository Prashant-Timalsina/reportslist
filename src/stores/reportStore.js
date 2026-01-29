import { defineStore } from 'pinia'

import { ref } from 'vue'

export const useReportStore = defineStore('reports', () => {
  const ALLOWED_TYPES = ref(['real', 'cached'])
  const ALLOWED_INTERVALS = ref(['hourly', 'daily', 'weekly', 'monthly'])

  const CONNECTIONS = ref([
    'PostgreSQL_Main',
    'MySQL_Sales',
    'Oracle_ERP',
    'Redis_Cache',
    'Firebird_Legacy',
    'Snowflake_WH',
  ])
  const ALLOWED_STATUSES = ref(['active', 'pending', 'inactive'])
  // Make sure to return this at the bottom of the store!

  const validateReport = (report) => {
    const isTypeValid = ALLOWED_TYPES.value.includes(report.type)
    const isIntervalValid = ALLOWED_INTERVALS.value.includes(report.interval)

    if (!isTypeValid) console.error(`Invalid Type: ${report.type}`)
    if (!isIntervalValid) console.error(`Invalid Interval: ${report.interval}`)

    return isTypeValid && isIntervalValid
  }

  // TABLE 1: Main Reports (The Parents)
  const table1 = ref([
    {
      id: 1,
      title: 'Financial Performance',
      description: 'Monthly revenue and expense tracking across all departments.',
      slug: 'financial-performance',
      type: 'real', // Must be 'real' or 'cached'
      interval: 'monthly', // Allowed: hourly, daily, weekly, monthly
      parameters: { currency: 'USD', region: 'Global' },
    },
    {
      id: 2,
      title: 'Daily User Traffic',
      description: 'Real-time monitoring of active users on the platform.',
      slug: 'daily-user-traffic',
      type: 'real',
      interval: 'daily',
      parameters: { device: 'all' },
    },
    {
      id: 3,
      title: 'System Health Log',
      description: 'Weekly summary of server uptime and error rates.',
      slug: 'system-health-log',
      type: 'cached',
      interval: 'weekly',
      parameters: { serverId: 'SF-01' },
    },
  ])

  // TABLE 2: Linked Detailed Reports
  const reportItems = ref([
    // LINKED TO REPORT 1 (Financial Performance) - 7 items
    {
      id: 101,
      report_id: 1,
      title: 'Revenue Q1',
      description: 'January to March stats',
      status: 'active',
      sql_query: 'SELECT * FROM revenue WHERE q=1',
      connection: 'PostgreSQL_Main',
    },
    {
      id: 102,
      report_id: 1,
      title: 'Revenue Q2',
      description: 'April to June stats',
      status: 'active',
      sql_query: 'SELECT * FROM revenue WHERE q=2',
      connection: 'PostgreSQL_Main',
    },
    {
      id: 103,
      report_id: 1,
      title: 'Expense Tracker',
      description: 'Department costs',
      status: 'active',
      sql_query: 'SELECT * FROM expenses',
      connection: 'MySQL_Sales',
    },
    {
      id: 104,
      report_id: 1,
      title: 'Tax Summary',
      description: 'Annual tax projections',
      status: 'pending',
      sql_query: 'SELECT * FROM tax',
      connection: 'Oracle_ERP',
    },
    {
      id: 105,
      report_id: 1,
      title: 'Payroll Data',
      description: 'Monthly salary disbursements',
      status: 'active',
      sql_query: 'SELECT * FROM payroll',
      connection: 'PostgreSQL_Main',
    },
    {
      id: 106,
      report_id: 1,
      title: 'Audit Log',
      description: 'Financial audit trail',
      status: 'active',
      sql_query: 'SELECT * FROM audit',
      connection: 'PostgreSQL_Main',
    },
    {
      id: 107,
      report_id: 1,
      title: 'Investor Deck Data',
      description: 'Data for stakeholders',
      status: 'inactive',
      sql_query: 'SELECT * FROM investor_stats',
      connection: 'BigQuery_Analytics',
    },

    // LINKED TO REPORT 2 (Daily User Traffic) - 7 items
    {
      id: 201,
      report_id: 2,
      title: 'Mobile Users',
      description: 'Android & iOS traffic',
      status: 'active',
      sql_query: 'SELECT * FROM traffic WHERE device="mobile"',
      connection: 'MongoDB_Logs',
    },
    {
      id: 202,
      report_id: 2,
      title: 'Desktop Users',
      description: 'Web browser traffic',
      status: 'active',
      sql_query: 'SELECT * FROM traffic WHERE device="desktop"',
      connection: 'MongoDB_Logs',
    },
    {
      id: 203,
      report_id: 2,
      title: 'Country Breakdown',
      description: 'Users by geography',
      status: 'active',
      sql_query: 'SELECT count(*) FROM users GROUP BY country',
      connection: 'BigQuery_Analytics',
    },
    {
      id: 204,
      report_id: 2,
      title: 'Bounce Rate',
      description: 'Percentage of quick exits',
      status: 'active',
      sql_query: 'SELECT bounce FROM analytics',
      connection: 'Snowflake_WH',
    },
    {
      id: 205,
      report_id: 2,
      title: 'New Signups',
      description: 'User registrations today',
      status: 'active',
      sql_query: 'SELECT * FROM users WHERE created_at = TODAY',
      connection: 'PostgreSQL_Main',
    },
    {
      id: 206,
      report_id: 2,
      title: 'Session Duration',
      description: 'Average time on site',
      status: 'active',
      sql_query: 'SELECT avg_time FROM sessions',
      connection: 'Redis_Cache',
    },
    {
      id: 207,
      report_id: 2,
      title: 'Referral Sources',
      description: 'Where users come from',
      status: 'active',
      sql_query: 'SELECT source FROM traffic',
      connection: 'MongoDB_Logs',
    },

    // LINKED TO REPORT 3 (System Health Log) - 6 items
    {
      id: 301,
      report_id: 3,
      title: 'CPU Usage',
      description: 'Server processor load',
      status: 'active',
      sql_query: 'SELECT cpu FROM metrics',
      connection: 'SQLite_Local',
    },
    {
      id: 302,
      report_id: 3,
      title: 'Memory Leak Check',
      description: 'RAM consumption patterns',
      status: 'active',
      sql_query: 'SELECT ram FROM metrics',
      connection: 'SQLite_Local',
    },
    {
      id: 303,
      report_id: 3,
      title: 'Error 500 Frequency',
      description: 'Server crash log',
      status: 'active',
      sql_query: 'SELECT * FROM logs WHERE status=500',
      connection: 'Firebird_Legacy',
    },
    {
      id: 304,
      report_id: 3,
      title: 'Database Latency',
      description: 'Query response times',
      status: 'active',
      sql_query: 'SELECT latency FROM db_monitor',
      connection: 'MariaDB_Backup',
    },
    {
      id: 305,
      report_id: 3,
      title: 'API Uptime',
      description: 'Endpoint availability',
      status: 'active',
      sql_query: 'SELECT uptime FROM api',
      connection: 'SQLite_Local',
    },
    {
      id: 306,
      report_id: 3,
      title: 'Storage Capacity',
      description: 'Disk space remaining',
      status: 'active',
      sql_query: 'SELECT space FROM disk',
      connection: 'SQLite_Local',
    },
  ])

  // We will fill these with seeds on Day 2 & 4

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

  const nextReportId = ref(4)
  const nextItemId = ref(307)

  const addReport = (newReport) => {
    const id = nextReportId.value++
    table1.value.push({
      id,
      ...newReport,
      slug: newReport.slug || '',
      parameters: newReport.parameters || {},
    })

    saveToDisk()
  }

  const addItem = (reportId, newItem) => {
    const id = nextItemId.value++
    reportItems.value.push({
      id,
      report_id: parseInt(reportId),
      ...newItem,
    })

    saveToDisk()
  }

  const savedT1 = localStorage.getItem('table1')
  if (savedT1) table1.value = JSON.parse(savedT1)

  const savedT2 = localStorage.getItem('table2')
  if (savedT2) reportItems.value = JSON.parse(savedT2)

  // watch(
  //   [table1, reportItems],
  //   () => {
  //     localStorage.setItem('table1', JSON.stringify(table1.value))
  //     localStorage.setItem('table2', JSON.stringify(reportItems.value))
  //   },
  //   { deep: true },
  // )

  const saveToDisk = () => {
    localStorage.setItem('table1', JSON.stringify(table1.value))
    localStorage.setItem('table2', JSON.stringify(reportItems.value))
    console.log('Data Saved successfully')
  }

  const deleteReport = (id) => {
    table1.value = table1.value.filter((r) => r.id !== id)
    reportItems.value = reportItems.value.filter((item) => item.report_id !== id)

    saveToDisk()
  }

  const deleteItem = (id) => {
    reportItems.value = reportItems.value.filter((item) => item.id !== id)

    saveToDisk()
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
    saveToDisk,

    getItemsforReport,
    getReportById,
    updateReportTitle,

    addReport,
    addItem,

    deleteReport,
    deleteItem,
  }
})
