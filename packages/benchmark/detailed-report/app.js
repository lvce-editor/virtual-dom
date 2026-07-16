const $metadata = document.querySelector('#metadata')
const $chart = document.querySelector('#chart')
const $hotspots = document.querySelector('#hotspots')
const $tests = document.querySelector('#tests')
const $contexts = document.querySelector('#contexts')
const $workloadTitle = document.querySelector('#workload-title')
const $workloadDescription = document.querySelector('#workload-description')

const formatDuration = (value) => {
  return `${value.toFixed(2)} ms`
}

const formatPercent = (value, total) => {
  if (total === 0) {
    return '0.0%'
  }
  return `${((value / total) * 100).toFixed(1)}%`
}

const createMetaCard = (label, value, detail) => {
  const $card = document.createElement('article')
  $card.className = 'meta-card'
  const $label = document.createElement('span')
  $label.textContent = label
  const $value = document.createElement('strong')
  $value.textContent = value
  const $detail = document.createElement('small')
  $detail.textContent = detail
  $card.append($label, $value, $detail)
  return $card
}

const getLocation = (hotspot) => {
  if (!hotspot.url) {
    return 'Bundled or native script'
  }
  const fileName = hotspot.url.split('/').at(-1)
  return `${fileName}:${hotspot.lineNumber + 1}:${hotspot.columnNumber + 1}`
}

const renderChart = (report) => {
  const results = report.analysis.hotspots
    .filter((hotspot) => hotspot.selfMs > 0)
    .slice(0, 12)
  const maximum = Math.max(...results.map((result) => result.selfMs), 0)
  const fragment = document.createDocumentFragment()
  for (const result of results) {
    const $row = document.createElement('div')
    $row.className = 'bar-row'
    const $label = document.createElement('div')
    $label.className = 'bar-label'
    const $name = document.createElement('strong')
    $name.textContent = result.functionName
    const $detail = document.createElement('small')
    $detail.textContent = getLocation(result)
    $label.append($name, $detail)
    const $track = document.createElement('div')
    $track.className = 'bar-track'
    const $bar = document.createElement('div')
    $bar.className = 'bar'
    $bar.style.width =
      maximum === 0 ? '0%' : `${(result.selfMs / maximum) * 100}%`
    $track.append($bar)
    const $value = document.createElement('strong')
    $value.className = 'bar-value'
    $value.textContent = formatDuration(result.selfMs)
    $row.append($label, $track, $value)
    fragment.append($row)
  }
  if (results.length === 0) {
    const $empty = document.createElement('div')
    $empty.className = 'empty'
    $empty.textContent = 'No virtual DOM samples were captured.'
    fragment.append($empty)
  }
  $chart.replaceChildren(fragment)
}

const renderHotspots = (report) => {
  const fragment = document.createDocumentFragment()
  for (const hotspot of report.analysis.hotspots.slice(0, 50)) {
    const $row = document.createElement('tr')
    const $nameCell = document.createElement('td')
    const $name = document.createElement('strong')
    $name.textContent = hotspot.functionName
    const $location = document.createElement('small')
    $location.textContent = getLocation(hotspot)
    $nameCell.append($name, $location)
    const values = [
      formatDuration(hotspot.selfMs),
      formatDuration(hotspot.inclusiveMs),
      String(hotspot.samples),
      hotspot.contexts.join(', '),
    ]
    $row.append($nameCell)
    for (const value of values) {
      const $cell = document.createElement('td')
      $cell.textContent = value
      $row.append($cell)
    }
    fragment.append($row)
  }
  $hotspots.replaceChildren(fragment)
}

const renderTests = (report) => {
  const fragment = document.createDocumentFragment()
  for (const result of report.tests.slice(0, 50)) {
    const $row = document.createElement('tr')
    const $name = document.createElement('td')
    $name.textContent = result.name
    const $status = document.createElement('td')
    $status.textContent = result.status
    $status.dataset.status = result.status
    const $duration = document.createElement('td')
    $duration.textContent = formatDuration(result.duration)
    $row.append($name, $status, $duration)
    fragment.append($row)
  }
  $tests.replaceChildren(fragment)
}

const renderContexts = (report) => {
  const fragment = document.createDocumentFragment()
  for (const context of report.analysis.contexts) {
    const $row = document.createElement('tr')
    const $name = document.createElement('td')
    const $link = document.createElement('a')
    $link.className = 'profile-link'
    $link.href = context.file
    $link.textContent = context.name
    $name.append($link)
    const values = [
      formatDuration(context.totalProfiledMs),
      `${formatDuration(context.virtualDomInclusiveMs)} (${formatPercent(
        context.virtualDomInclusiveMs,
        context.totalProfiledMs,
      )})`,
      String(context.sampleCount),
    ]
    $row.append($name)
    for (const value of values) {
      const $cell = document.createElement('td')
      $cell.textContent = value
      $row.append($cell)
    }
    fragment.append($row)
  }
  $contexts.replaceChildren(fragment)
}

const renderMetadata = (report) => {
  const generatedAt = new Date(report.generatedAt)
  const allowedFailed = report.summary.allowedFailed || 0
  const failureDetail =
    allowedFailed === 0
      ? `${report.summary.failed} failed`
      : `${report.summary.failed} failed · ${allowedFailed} allowed`
  $metadata.append(
    createMetaCard(
      `${report.workload.label} tests`,
      `${report.summary.passed} passed`,
      `${report.summary.skipped} skipped · ${failureDetail}`,
    ),
    createMetaCard(
      'Virtual DOM CPU',
      formatDuration(report.analysis.virtualDomInclusiveMs),
      `${formatPercent(
        report.analysis.virtualDomInclusiveMs,
        report.analysis.totalProfiledMs,
      )} of sampled stacks`,
    ),
    createMetaCard(
      'Profiles',
      String(report.analysis.profileCount),
      `${report.analysis.sampleCount.toLocaleString()} V8 samples · ${
        report.capture.detachedTargetCount
      } detached`,
    ),
    createMetaCard(
      'Browser',
      `${report.browser.name} ${report.browser.version}`,
      report.environment.platform,
    ),
    createMetaCard(
      `${report.workload.label} commit`,
      report.workload.commit.slice(0, 12),
      `server ${report.serverVersion}`,
    ),
    createMetaCard(
      'Generated',
      generatedAt.toLocaleDateString(),
      generatedAt.toLocaleTimeString(),
    ),
  )
}

const render = (report) => {
  document.title = report.title
  $workloadTitle.textContent = `${report.workload.label} CPU profile`
  $workloadDescription.textContent =
    `Every ${report.workload.id} e2e test runs through one load of the ` +
    '--reuse-page runner while V8 samples the page and all worker execution contexts.'
  renderMetadata(report)
  renderChart(report)
  renderHotspots(report)
  renderTests(report)
  renderContexts(report)
}

try {
  const response = await fetch('./benchmark-results.json')
  if (!response.ok) {
    throw new Error(`Unable to load results (${response.status})`)
  }
  render(await response.json())
} catch (error) {
  const $error = document.createElement('div')
  $error.className = 'error'
  $error.textContent = error instanceof Error ? error.message : String(error)
  $chart.replaceChildren($error)
}
