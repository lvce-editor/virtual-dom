const $metadata = document.querySelector('#metadata')
const $chart = document.querySelector('#chart')
const $results = document.querySelector('#results')
const $sort = document.querySelector('#sort')

const formatDuration = (value) => {
  return `${value.toFixed(2)} ms`
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

const getSortedResults = (results, sort) => {
  const copy = [...results]
  switch (sort) {
    case 'fastest':
      return copy.sort((a, b) => a.median - b.median)
    case 'slowest':
      return copy.sort((a, b) => b.median - a.median)
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return copy
  }
}

const renderChart = (results) => {
  const maximum = Math.max(...results.map((result) => result.median))
  const fragment = document.createDocumentFragment()
  for (const result of results) {
    const $row = document.createElement('div')
    $row.className = 'bar-row'

    const $label = document.createElement('div')
    $label.className = 'bar-label'
    const $name = document.createElement('strong')
    $name.textContent = result.name
    const $detail = document.createElement('small')
    $detail.textContent = `${result.samples.length} independent run medians`
    $label.append($name, $detail)

    const $track = document.createElement('div')
    $track.className = 'bar-track'
    const $bar = document.createElement('div')
    $bar.className = 'bar'
    $bar.style.width = `${(result.median / maximum) * 100}%`
    $track.append($bar)

    const $value = document.createElement('strong')
    $value.className = 'bar-value'
    $value.textContent = formatDuration(result.median)
    $row.append($label, $track, $value)
    fragment.append($row)
  }
  $chart.replaceChildren(fragment)
}

const renderTable = (results) => {
  const fragment = document.createDocumentFragment()
  for (const result of results) {
    const $row = document.createElement('tr')
    const values = [
      formatDuration(result.median),
      formatDuration(result.mean),
      formatDuration(result.p95),
      formatDuration(result.standardDeviation),
      `${formatDuration(result.min)}–${formatDuration(result.max)}`,
    ]
    const $nameCell = document.createElement('td')
    const $name = document.createElement('strong')
    $name.textContent = result.name
    const $description = document.createElement('small')
    $description.textContent = result.description
    $nameCell.append($name, $description)
    $row.append($nameCell)
    for (const value of values) {
      const $cell = document.createElement('td')
      $cell.textContent = value
      $row.append($cell)
    }
    fragment.append($row)
  }
  $results.replaceChildren(fragment)
}

const render = (report) => {
  const generatedAt = new Date(report.generatedAt)
  $metadata.append(
    createMetaCard(
      'Browser',
      `${report.browser.name} ${report.browser.version}`,
      report.environment.platform,
    ),
    createMetaCard(
      'Samples',
      `${report.config.repeats} independent runs`,
      `${report.config.iterations} measured · ${report.config.warmupIterations} warmup each`,
    ),
    createMetaCard('Commit', report.commit.slice(0, 12), report.branch),
    createMetaCard(
      'Generated',
      generatedAt.toLocaleDateString(),
      generatedAt.toLocaleTimeString(),
    ),
  )

  const updateResults = () => {
    const sorted = getSortedResults(report.results, $sort.value)
    renderChart(sorted)
    renderTable(sorted)
  }
  $sort.addEventListener('change', updateResults)
  updateResults()
}

try {
  const response = await fetch('./benchmark-results.json')
  if (!response.ok) {
    throw new Error(`Unable to load results (${response.status})`)
  }
  render(await response.json())
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  $chart.innerHTML = `<div class="error">${message}</div>`
}
