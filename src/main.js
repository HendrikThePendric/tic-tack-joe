import './style.css'

document.addEventListener('DOMContentLoaded', laadSpel)

const spelers = {
  p1: 'Speler 1',
  p2: 'Speler 2',
}
const punten = { p1: 0, p2: 0 }
let aanDeBeurt = 'p1'
const zetten = {}
const winCombinaties = [
  ['h1v1', 'h1v2', 'h1v3'], // bovenste rij
  ['h2v1', 'h2v2', 'h2v3'], // middelste rij
  ['h3v1', 'h3v2', 'h3v3'], // onderste rij
  ['h1v1', 'h2v1', 'h3v1'], // linker kolom
  ['h1v2', 'h2v2', 'h3v2'], // middelste kolom
  ['h1v3', 'h2v3', 'h3v3'], // rechter kolom
  ['h1v1', 'h2v2', 'h3v3'], // diagonaal links-boven naar rechts-onder
  ['h1v3', 'h2v2', 'h3v1'], // diagonaal rechts-boven naar links-onder
]
let slingerAnimatie = null

// --- Spelverloop ---

function laadSpel() {
  zetSpelerTekst()
  document.querySelectorAll('button.vierkant').forEach((el) => {
    el.addEventListener('click', opVierkantKlik)
  })
  document.getElementById('herstart-knop').addEventListener('click', herstart)
}

function opVierkantKlik(event) {
  const vierkant = event.target
  zetten[vierkant.id] = aanDeBeurt
  vierkant.setAttribute('disabled', true)

  if (aanDeBeurt === 'p1') {
    vierkant.textContent = 'X'
    controleerWinCombinaties()
    aanDeBeurt = 'p2'
  } else {
    vierkant.textContent = 'O'
    controleerWinCombinaties()
    aanDeBeurt = 'p1'
  }

  zetSpelerTekst()
}

function controleerWinCombinaties() {
  for (const combinatie of winCombinaties) {
    const isGewonnen = combinatie.every(
      (vierkant) => zetten[vierkant] === aanDeBeurt
    )
    if (isGewonnen) {
      combinatie.forEach((id) => {
        document.getElementById(id).classList.add('winnaar')
      })
      toonUitslag(true)
      return
    }
  }
  if (Object.keys(zetten).length === 9) {
    toonUitslag(false)
  }
}

function herstart() {
  aanDeBeurt = 'p1'
  for (const sleutel in zetten) delete zetten[sleutel]

  document.querySelectorAll('button.vierkant').forEach((el) => {
    el.textContent = ''
    el.removeAttribute('disabled')
    el.classList.remove('winnaar')
  })

  document.getElementById('uitslag').classList.add('verborgen')
  document.getElementById('beurt').style.visibility = ''
  stopSlingers()
  zetSpelerTekst()
}

// --- Scherm bijwerken ---

function zetSpelerTekst() {
  document.getElementById('speler').textContent = spelers[aanDeBeurt]
}

function toonUitslag(isWinnaar) {
  document.getElementById('beurt').style.visibility = 'hidden'
  document
    .querySelectorAll('button.vierkant')
    .forEach((el) => el.setAttribute('disabled', true))

  const uitslag = document.getElementById('uitslag')
  const tekst = document.getElementById('uitslag-tekst')

  if (isWinnaar) {
    tekst.textContent = `👑 ${spelers[aanDeBeurt]} wint! 🏆`
    tekst.className = 'winnaar'
    punten[aanDeBeurt]++
    bijwerkScoreBord()
    startSlingers()
  } else {
    tekst.textContent = 'Geen winnaar'
    tekst.className = 'gelijkspel'
  }

  uitslag.classList.remove('verborgen')
}

function bijwerkScoreBord() {
  document.getElementById('punten-speler1').textContent = punten.p1
  document.getElementById('punten-speler2').textContent = punten.p2

  const rij1 = document.getElementById('rij-speler1')
  const rij2 = document.getElementById('rij-speler2')
  const leider = document.getElementById('leider-tekst')

  rij1.classList.toggle('leider', punten.p1 > punten.p2)
  rij2.classList.toggle('leider', punten.p2 > punten.p1)

  if (punten.p1 > punten.p2) {
    leider.textContent = `👑 ${spelers.p1} staat voor`
  } else if (punten.p2 > punten.p1) {
    leider.textContent = `👑 ${spelers.p2} staat voor`
  } else {
    leider.textContent = 'Ze staan gelijk!'
  }
}

// --- Slingers animatie ---

function startSlingers() {
  const canvas = document.getElementById('slingers')
  const ctx = canvas.getContext('2d')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvas.style.display = 'block'

  const kleuren = [
    '#e74c3c',
    '#3498db',
    '#2ecc71',
    '#f1c40f',
    '#9b59b6',
    '#e67e22',
  ]
  const deeltjes = Array.from({ length: 120 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height,
    breedte: Math.random() * 10 + 5,
    hoogte: Math.random() * 6 + 3,
    kleur: kleuren[Math.floor(Math.random() * kleuren.length)],
    snelheid: Math.random() * 3 + 2,
    slingering: Math.random() * 2 - 1,
    hoek: Math.random() * Math.PI * 2,
    draaiSnelheid: Math.random() * 0.1 - 0.05,
  }))

  function teken() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const d of deeltjes) {
      ctx.save()
      ctx.translate(d.x + d.breedte / 2, d.y + d.hoogte / 2)
      ctx.rotate(d.hoek)
      ctx.fillStyle = d.kleur
      ctx.fillRect(-d.breedte / 2, -d.hoogte / 2, d.breedte, d.hoogte)
      ctx.restore()

      d.y += d.snelheid
      d.x += d.slingering
      d.hoek += d.draaiSnelheid

      if (d.y > canvas.height) {
        d.y = -d.hoogte
        d.x = Math.random() * canvas.width
      }
    }
    slingerAnimatie = requestAnimationFrame(teken)
  }

  teken()
}

function stopSlingers() {
  if (slingerAnimatie) {
    cancelAnimationFrame(slingerAnimatie)
    slingerAnimatie = null
  }
  const canvas = document.getElementById('slingers')
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  canvas.style.display = 'none'
}
