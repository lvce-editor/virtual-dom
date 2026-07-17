const $metadata = document.querySelector('#metadata')
const $workloads = document.querySelector('#workloads')
const $methods = document.querySelector('#methods')

const formatBytes = (bytes) => {
  if (bytes < 1024) {
    return `${bytes.toLocaleString()} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KiB`
  }
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`
}

const createMetaCard = (label, value, detail) => {
  const $card = document.createElement('article')
  const $label = document.createElement('span')
  const $value = document.createElement('strong')
  const $detail = document.createElement('small')
  $label.textContent = label
  $value.textContent = value
  $detail.textContent = detail
  $card.append($label, $value, $detail)
  return $card
}

const createLink = (href, text) => {
  const $link = document.createElement('a')
  $link.href = href
  $link.textContent = text
  return $link
}

const renderMetadata = (report) => {
  const generatedAt = new Date(report.generatedAt)
  $metadata.append(
    createMetaCard(
      'Virtual DOM calls',
      report.total.virtualDom.toLocaleString(),
      `${report.total.received.toLocaleString()} renderer messages inspected`,
    ),
    createMetaCard(
      'All message size',
      formatBytes(report.total.receivedJsonBytes),
      `${report.total.rendererCommands.toLocaleString()} renderer commands`,
    ),
    createMetaCard(
      'Workloads',
      String(report.workloads.length),
      'one fresh browser per suite',
    ),
    createMetaCard(
      'Generated',
      generatedAt.toLocaleDateString(),
      generatedAt.toLocaleTimeString(),
    ),
  )
}

const renderWorkloads = (report) => {
  const fragment = document.createDocumentFragment()
  for (const result of report.workloads) {
    const $row = document.createElement('tr')
    const $name = document.createElement('td')
    const $nameStrong = document.createElement('strong')
    const $commit = document.createElement('small')
    $nameStrong.textContent = result.workload.label
    $commit.textContent = result.workload.commit.slice(0, 12)
    $name.append($nameStrong, $commit)
    const $calls = document.createElement('td')
    $calls.textContent = result.messages.virtualDom.count.toLocaleString()
    const $bytes = document.createElement('td')
    $bytes.textContent = formatBytes(result.messages.virtualDom.jsonBytes)
    const $received = document.createElement('td')
    $received.textContent = result.messages.received.toLocaleString()
    const $commandBytes = document.createElement('td')
    $commandBytes.textContent = formatBytes(
      result.messages.rendererCommands.jsonBytes,
    )
    const $noOps = document.createElement('td')
    $noOps.textContent = `${result.messages.rendererCommands.emptyPatches.toLocaleString()} / ${result.messages.rendererCommands.duplicateCss.toLocaleString()}`
    const $frameSpacing = document.createElement('td')
    $frameSpacing.textContent =
      result.messages.rendererCommands.renderBatches.under16Ms.toLocaleString()
    const $data = document.createElement('td')
    $data.append(
      createLink(result.messages.virtualDomPath, 'VDOM calls'),
      document.createTextNode(' · '),
      createLink(result.messages.receivedPath, 'all messages'),
      document.createTextNode(' · '),
      createLink(result.messages.timingsPath, 'timings'),
    )
    $row.append(
      $name,
      $calls,
      $bytes,
      $received,
      $commandBytes,
      $noOps,
      $frameSpacing,
      $data,
    )
    fragment.append($row)
  }
  $workloads.replaceChildren(fragment)
}

const renderMethods = (report) => {
  const fragment = document.createDocumentFragment()
  for (const result of report.workloads) {
    for (const method of result.messages.rendererCommands.methods) {
      const $row = document.createElement('tr')
      for (const value of [
        result.workload.label,
        method.method,
        method.count.toLocaleString(),
        formatBytes(method.jsonBytes),
      ]) {
        const $cell = document.createElement('td')
        $cell.textContent = value
        $row.append($cell)
      }
      fragment.append($row)
    }
  }
  $methods.replaceChildren(fragment)
}

try {
  const response = await fetch('./benchmark-results.json')
  if (!response.ok) {
    throw new Error(`Unable to load results (${response.status})`)
  }
  const report = await response.json()
  renderMetadata(report)
  renderWorkloads(report)
  renderMethods(report)
} catch (error) {
  const $message = document.createElement('p')
  $message.className = 'error'
  $message.textContent = error instanceof Error ? error.message : String(error)
  $workloads.replaceChildren($message)
}
