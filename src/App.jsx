import { useEffect } from 'react'
import { BonsaiScene } from './components/BonsaiScene'
import beyondFairUseText from './beyondFairUse.md?raw'
import gamesBitingBackText from './gamesBitingBack.md?raw'

const projects = [
  { title: 'Surely, AI Can', image: '/images/large/surelyaican.jpg', href: 'https://surelyaican.com/', text: 'A parody AI benchmarking site that shows the surprising ways frontier models fail.' },
  { title: 'Parsem: AI Search Redesigned', image: '/images/large/parsem.png', href: 'https://parsemsearch.app/', text: 'AI search rebuilt for transparency — every part of each answer links to a real, visible source, giving credit back to the people who wrote it.' },
  { title: 'Every Creeping Thing', image: '/images/thumbs/ectsmall.png', href: '/ect.html', text: 'A 3D game where the player sees the world from the perspective of different animals. Sound design by Seth S. Scott.' },
  { title: 'Standard Assets', image: '/images/thumbs/standardassetssmall.gif', href: 'https://alxdncn.itch.io/standard-assets', text: 'An experimental 3D game examining the environment package of Unity Standard Assets.' },
  { title: 'On Nature', image: '/images/thumbs/OnNatureGif-small.gif', href: 'https://alxdncn.itch.io/on-nature', text: 'A web game depicting an environment in different representational modes.' },
  { title: 'Space Kitty', image: '/images/thumbs/spacekittysmall.png', href: 'https://tafkaf.itch.io/space-kitty', text: 'A digital and physical game where players use their phone flashlights to protect a space kitty from dogliens. Collaboration with Karina Popp.' },
  { title: 'Small Song', image: '/images/thumbs/smallsongsmall.png', href: 'https://alxdncn.itch.io/small-song', text: "A short interactive interpretation of A.R. Ammons's twelve-word poem, using the player's location and time to determine the sun and lighting." },
  { title: 'Flora', image: '/images/thumbs/florasmall.png', href: 'https://gamejolt.com/games/flora/54787', text: 'Help a small tree survive the seasons and grow to be a giant of the forest.' },
]

const professional = [
  { title: 'Looking Glass Unity Plugin', image: '/images/looking-glass-unity/unity-workflow.jpg', href: '/looking-glass-unity.html', text: 'A creator tool that translated light-field rendering into familiar Unity concepts: a volumetric camera, quilt capture, depth-aware focus, and 3D interaction.' },
  { title: 'Liteforms', image: '/images/thumbs/liteforms-small.gif', href: 'https://lookingglassfactory.com/liteforms', text: "A desktop application for talking to and creating holographic characters. A design exploration of embodied AI for Looking Glass displays, where I’m the product lead." },
  { title: 'Holographic Elemental', image: '/images/large/elemental-pixar-large.gif', href: 'https://blog.lookingglassfactory.com/thattimewewenttopixar/', text: 'For Pixar’s Elemental, I supported the team with visual design for bringing Ember and Wade to a Looking Glass display.' },
  { title: 'Bulgari Holographic Experience', image: '/images/thumbs/OctoFinissimo-small.png', href: 'https://www.linkedin.com/posts/ennio-piccirillo_digital-storytelling-experience-activity-7028844964054806528-0Dqy/', text: 'A pop-up holographic experience in Rome showcasing the Octo Finissimo Ultra. I worked on the interaction and visual design.' },
  { title: 'Investing in Futures', image: '/images/thumbs/InvestingInFutures-small.png', href: 'https://moreandmore.world/', text: 'A card game prompting players to imagine alternative global futures. I contributed to the game design for More&More Unlimited.' },
  { title: 'Holo Weather', image: '/images/thumbs/WeatherAppSmall.png', href: 'https://lookingglassfactory.com/', text: 'A HoloPlayer One app for exploring weather around the world through voice commands and Amazon Echo. Art by Jeff Chang.' },
  { title: 'DESIGNxBOULDER', image: '/images/thumbs/designxbouldersmall.png', href: 'https://www.bmoca.org/2016-2017-exhibitions/designxboulder', text: 'An interactive visualization of projects by Natalie Jeremijenko, displayed at the Boulder Museum of Contemporary Art in 2016.' },
]

const writing = [
  { title: 'Beyond Fair Use: Sustaining Journalism in the Age of AI', href: '/beyond-fair-use', text: 'A policy proposal for sustaining journalism as critical infrastructure for democracy and AI development.' },
  { title: 'Games Biting Back: ANATOMY and Ecofeminism', href: '/games-biting-back.html', text: 'An ecofeminist reading of Kitty Horrorshow’s ANATOMY, presented at DiGRA 2018 and published in the official abstract proceedings.' },
  { title: 'Finding Wriggle Room: How I Made a Maggot Simulator', href: 'https://heyzine.com/flip-book/406aa8c48d.html#page/17', text: 'Critical and creative considerations behind my thesis, Every Creeping Thing. Published by A MAZE Magazine.' },
  { title: 'Savage Beasts: Civilization and Wilderness in Skyrim', href: 'https://www.firstpersonscholar.com/savage-beasts/', text: 'A look at the divisions between human civilization and hostile wilderness in Skyrim. Published by First Person Scholar.' },
  { title: 'When Lions Speak', href: '/whenlionsspeak.html', text: 'An analysis of how non-human animal avatars in games reflect and reinforce problematic power structures.' },
  { title: 'Time is Money', href: '/timeismoney.html', text: 'Cart Life, time management, and the instrumentalization of time in games and everyday life.' },
  { title: 'Ladies’ Man: Womanizing in The Witcher', href: 'https://web.archive.org/web/20140707102951/http://ontologicalgeek.com/ladies-man-womanizing-in-the-witcher/', text: 'A critical look at the mechanics of seduction and sex in The Witcher.' },
  { title: 'The Animist Blog', href: 'https://theanimistblog.wordpress.com/', text: 'An archive of my older essays.' },
]

function Header() {
  return <header className="site-header"><a className="wordmark" href="/"><span>Alex</span> Duncan</a><nav><a href="/portfolio.html">Work</a><a href="/#writing">Writing</a><a href="/about.html">About</a></nav></header>
}

function Arrow() { return <span aria-hidden="true">↗</span> }

function ProjectGrid({ items }) {
  return <div className="project-grid">{items.map((p, i) => <article className="project" key={p.title} style={{ '--delay': `${i * 45}ms` }}><a className="project-image" href={p.href}><img src={p.image} alt={`${p.title} project preview`} /><span className="project-index">{String(i + 1).padStart(2, '0')}</span></a><div className="project-copy"><h3><a href={p.href}>{p.title} <Arrow /></a></h3><p>{p.text}</p></div></article>)}</div>
}

function SectionHead({ kicker, title, action }) {
  return <div className="section-head"><div><p className="kicker">{kicker}</p><h2>{title}</h2></div>{action && <a className="text-link" href={action.href}>{action.label} →</a>}</div>
}

function Layout({ children }) {
  return <><Header /><main>{children}</main><footer><p>Alex Duncan</p><p>Brooklyn, New York · <a href="mailto:alxdncn@gmail.com">alxdncn@gmail.com</a></p><p>Games, technology & interactive art</p></footer></>
}

function HeroBonsai() {

  return (
    <div className="bonsai-hero" aria-hidden="true">
      <BonsaiScene seed={7319} branching={720} rootBranching={285} speed={0.6} paused={false} onStats={() => {}} />
    </div>
  )
}

function Home() {
  return <Layout><section className="hero"><HeroBonsai /><div className="hero-copy"><p className="hero-statement">I make games, interactive art, AI experiences, and holographic software.</p><p className="hero-note">Often exploring how technology changes our relationship with the natural world.</p></div></section><section><SectionHead kicker="01 / Selected work" title="Games & interactive art" action={{ href: '/portfolio.html', label: 'View all work' }} /><ProjectGrid items={projects.slice(0, 4)} /></section><section id="writing"><SectionHead kicker="02 / Selected writing" title="Critical practice" /><div className="writing-list">{writing.map((w, i) => <a href={w.href} className="writing-row" key={w.title}><span>{String(i + 1).padStart(2, '0')}</span><h3>{w.title}</h3><p>{w.text}</p><Arrow /></a>)}</div></section><section className="contact"><p className="kicker">03 / Contact</p><h2>Questions, collaborations,<br />or just want to say hi?</h2><a className="button" href="mailto:alxdncn@gmail.com">Get in touch <Arrow /></a></section></Layout>
}

function Portfolio() {
  return <Layout><div className="page-intro"><p className="kicker">Selected work · 2015—2026</p><h1>Projects</h1><p>Games, interactive art, AI experiments, and holographic experiences.</p></div><section><SectionHead kicker="01" title="Game / art projects" /><ProjectGrid items={projects} /></section><section><SectionHead kicker="02" title="Professional work" /><ProjectGrid items={professional} /></section></Layout>
}

function About() {
  return <Layout><div className="page-intro about-intro"><p className="kicker">About</p><h1>Alex Duncan</h1><p className="lede">I’m a product manager and technologist living in Brooklyn.</p></div><section className="prose about-grid"><div><p>I manage the software that powers the holographic displays made at <a href="https://lookingglassfactory.com">Looking Glass</a>. I grew up in Vancouver, Canada, did my MFA at the NYU Game Center, and enjoy writing and making weird digital experiences.</p><p>I like to hike, kayak, bird watch, play chess, and read speculative fiction.</p></div><div><p>My creative and critical work often centers on the way humans relate to non-human animals and the natural environment, the way natural spaces are depicted in digital media, and how novel technologies impact social structures.</p><p><a href="mailto:alxdncn@gmail.com">Email</a> · <a href="https://www.linkedin.com/in/alex-duncan-a3082a123/">LinkedIn</a></p></div></section></Layout>
}

const essays = {
  '/savagebeasts.html': { title: 'Savage Beasts: The Spatial Conflict Between Civilization and Wilderness in The Elder Scrolls V: Skyrim', paragraphs: ['In The Elder Scrolls V: Skyrim, players encounter a vast virtual environment, populated by numerous and diverse creatures. The virtual space of the game, however, is not homogeneous. Various aspects of its representation and structure create a division between urban space, or civilization, and the non-urban natural environment, or wilderness. The differences between these two spaces create a world in which the natural environment is seen as threateningly hostile, a space that must be overcome and dominated.', 'As ecofeminist thinkers like Val Plumwood have stressed, the binary division between civilization and nature is part of the conceptual structure justifying race- and gender-based oppression: those aligned with nature and wilderness are different and inferior, and so can be denied full rights and colonized. The environment depicted in Skyrim is a virtual one, but the paradigm it reflects and reinforces has dire consequences for all things deemed “natural.”', 'This essay is currently under consideration for publication.'] },
  '/timeismoney.html': { title: 'Time is Money: Cart Life and the Instrumentalization of Time', paragraphs: ['In his book 24/7: Late Capitalism and the Ends of Sleep, Jonathan Crary writes that “sleep is an uncompromising interruption of the theft of time from us by capitalism.” In contemporary capitalist societies, individuals’ time is instrumentalized for production, circulation, and consumption, with the one exception of the time when they are asleep. A similar representation can be seen in digital games, where waking time is directed towards completing missions and gaining currency.', 'This paper shows how Richard Hofmeier’s Cart Life uses goal-based mechanics to comment on the instrumentalization of people’s time due to financial concerns. With a clock that moves relentlessly forward, tasks that require precise timing, and an overall deadline, every moment must be optimized. The rare exception is sleeping time, which serves as a welcome rest from the intensity of waking life, though one constantly encroached upon.', <>This paper was presented at the <a href="https://extendingplay.rutgers.edu/">Extending Play conference</a> at Rutgers University.</>] },
  '/whenlionsspeak.html': { title: 'When Lions Speak: Representations of Non-Human Avatars in Digital Games', paragraphs: ['When we play a game where the avatar is a non-human animal, how is this experience of otherness represented, if at all? This paper takes Might and Delight’s Shelter and Maxis’s Spore as case studies to examine the ways digital games typically reinscribe a logocentric framework that posits animal ontology as inferior.', 'This framework has a long history in Western philosophy and finds one of its most coherent articulations in the work of René Descartes. Descartes locates human subjectivity in the possession of a rational mind. In denying this capacity in other life-forms, he also deprives them of subjectivity, individuality, and the rights of individuals.', 'The lack of nuance with which Shelter and Spore treat animal avatars reflects this traditional representation through an emphasis on visual perception, lack of individual differentiation, symbolization of the avatar, and use of traditional control schemes. Drawing on Jacques Derrida, Giorgio Agamben, Cary Wolfe, and Brian Massumi, I suggest alternative approaches to representing non-human animals as game avatars.', <>A version was presented at the <a href="https://gameslit15.wordpress.com/">Games and Literary Theory conference</a>. An expanded version was presented at <a href="https://digra.org/">DiGRA 2016</a>.</>] },
}

function Essay({ essay }) {
  return <Layout><article className="essay"><p className="kicker">Writing · Abstract</p><h1>{essay.title}</h1><div className="prose">{essay.paragraphs.map((p, i) => <p key={i}>{p}</p>)}</div></article></Layout>
}

function renderInline(text) {
  const nodes = []
  const pattern = /(\[([^\]]+)\]\((https?:\/\/[^)]+)\)|\*([^*]+)\*)/g
  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) nodes.push(text.slice(lastIndex, match.index))
    if (match[2] && match[3]) nodes.push(<a key={nodes.length} href={match[3]}>{match[2]}</a>)
    else if (match[4]) nodes.push(<em key={nodes.length}>{match[4]}</em>)
    lastIndex = pattern.lastIndex
  }

  if (lastIndex < text.length) nodes.push(text.slice(lastIndex))
  return nodes
}

function MarkdownEssay({ title, subtitle, markdown }) {
  const blocks = markdown
    .replace(/\r\n/g, '\n')
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block && !block.startsWith('!'))

  return (
    <Layout>
      <article className="essay">
        <p className="kicker">Writing · Essay</p>
        <h1>{title}</h1>
        {subtitle && <p className="essay-subtitle"><em>{subtitle}</em></p>}
        <div className="prose">
          {blocks.map((block, index) => {
            if (block === '---') return <hr className="essay-divider" key={index} />
            if (block.startsWith('### ')) return <h3 key={index}>{renderInline(block.slice(4))}</h3>
            if (block.startsWith('# ')) return <h2 key={index}>{renderInline(block.slice(2))}</h2>
            return <p key={index}>{renderInline(block)}</p>
          })}
        </div>
      </article>
    </Layout>
  )
}

function BeyondFairUse() {
  return (
    <MarkdownEssay
      title="Beyond Fair Use: Sustaining Journalism in the Age of AI"
      subtitle="Final project for the BlueDot Impact AI Governance course, spring 2025"
      markdown={beyondFairUseText}
    />
  )
}

function QuiltDiagram() {
  return (
    <figure className="quilt-figure">
      <img src="/images/looking-glass-unity/quilt-sample.avif" alt="A quilt containing 48 tiled views of the same stylized three-dimensional scene" loading="lazy" />
      <figcaption><span>48 perspectives</span><span>one standard image or video</span></figcaption>
    </figure>
  )
}

function GamesBitingBack() {
  return (
    <MarkdownEssay
      title="Games Biting Back: ANATOMY and Ecofeminism"
      subtitle="Presented at DiGRA 2018: The Game is the Message, University of Turin, Turin, Italy, July 25–28, 2018"
      markdown={gamesBitingBackText}
    />
  )
}

function CursorDiagram() {
  return (
    <figure className="cursor-figure">
      <img src="/images/looking-glass-unity/3d-cursor.gif" alt="A red 3D cursor moving across white spheres positioned at different depths" loading="lazy" />
      <figcaption>Double-click an object to make its depth the new center of attention.</figcaption>
    </figure>
  )
}

function LookingGlassUnity() {
  return (
    <Layout>
      <article className="case-study looking-glass-case">
        <header className="case-hero">
          <div className="case-hero-copy">
            <p className="kicker">Professional work · Looking Glass Factory</p>
            <h1><span>Looking Glass</span><span>Unity Plugin</span></h1>
            <p className="case-deck">Designing a camera, media format, and interaction model for a display where depth is part of the interface.</p>
          </div>
          <figure className="case-hero-image">
            <img src="/images/looking-glass-unity/unity-workflow.jpg" alt="A Unity scene running on a laptop beside a Looking Glass display" />
            <figcaption>From a familiar Unity scene to a group-viewable light field.</figcaption>
          </figure>
          <dl className="case-meta">
            <div><dt>Role</dt><dd>Product & interaction design</dd></div>
            <div><dt>Focus</dt><dd>Creator experience</dd></div>
            <div><dt>Team</dt><dd>Looking Glass Creator Tools</dd></div>
          </dl>
        </header>

        <section className="case-section case-opening">
          <p className="case-number">01 / Design premise</p>
          <div className="case-section-copy">
            <h2>A flat camera was the wrong metaphor.</h2>
            <p className="case-lede">Unity assumes a camera projects one view onto a flat screen. A Looking Glass display presents dozens of views at once, and the position of content in depth changes what people can comfortably see. The creator therefore needs to frame a <em>volume</em>, not just an image.</p>
            <p>The central customer-experience problem was translation: how could we expose the optical constraints of a light-field display without asking every Unity developer to become a display engineer? The plugin turned those constraints into spatial handles, familiar media files, and interaction patterns that creators could understand by looking and trying.</p>
          </div>
        </section>

        <section className="case-section case-camera">
          <p className="case-number">02 / Camera model</p>
          <div className="case-section-copy">
            <h2>The camera became a visible volume of space.</h2>
            <p>The Hologram Camera uses a box gizmo to show the physical-looking region available inside the display. Its focal—or zero-parallax—plane marks the depth where all rendered views converge and where content appears sharpest. Instead of hiding the optics in numbers, the interface makes the display’s visual volume something a creator can place around a scene.</p>
          </div>
          <figure className="case-media case-media-wide">
            <img src="/images/looking-glass-unity/camera-volume.gif" alt="Unity camera-volume gizmo with a model moving through the focal plane" loading="lazy" />
            <figcaption>The green box communicates the capture volume; the central plane is the crispest point in the light field.</figcaption>
          </figure>
          <div className="camera-modes">
            <div>
              <p className="mode-index">A</p>
              <h3>Volume mode</h3>
              <p>The camera behaves like a box of space. Creators orbit around the volume’s center, while the <em>Size</em> control expands or contracts the visible range around the focal plane. This is the most direct model of the display as a physical window onto a bounded scene.</p>
            </div>
            <div>
              <p className="mode-index">B</p>
              <h3>Camera mode</h3>
              <p>For people used to conventional cameras, the pivot moves to the central perspective and the focal plane becomes an adjustable parameter between the near and far clipping regions. This supports familiar framing and makes focus easy to animate.</p>
            </div>
          </div>
          <p className="case-note">A separate “depthiness” control lets creators expand or compress perceived depth without unexpectedly changing field of view or focus—the kind of decoupling that makes an expert tool feel predictable.</p>
        </section>

        <section className="case-section case-quilts">
          <p className="case-number">03 / Media system</p>
          <div className="case-section-copy">
            <h2>Quilts made a light field inspectable.</h2>
            <p>A quilt tiles every rendered perspective into one frame: the leftmost view begins at the bottom-left and the views progress across the grid. That single compositing convention made the light field visible to creators, debuggable by the team, and portable between tools.</p>
            <p>The important product decision was not to invent a proprietary container. Quilts live inside ordinary formats—PNG, JPG, GIF, MP4, MOV, or WebM—and a compact filename convention can record the grid and aspect ratio. A specialized 3D payload can therefore pass through familiar storage, playback, and web pipelines without custom processing at every step.</p>
          </div>
          <QuiltDiagram />
          <div className="format-line" aria-label="Common quilt media formats"><span>.png</span><span>.jpg</span><span>.gif</span><span>.mp4</span><span>.webm</span></div>
        </section>

        <section className="case-section case-focus">
          <p className="case-number">04 / Visual comfort</p>
          <div className="case-section-copy">
            <h2>Depth of field reframed an artifact as an aesthetic choice.</h2>
            <p>Content becomes harder to resolve as it moves away from the zero-parallax plane. In a multi-view render, that can show up as crosstalk: neighboring views leak into one another and look like unintended ghosting.</p>
            <p>We aligned depth of field with the holographic focal plane so the same region stays sharp across the view set. A strong, photographic falloff does not eliminate the optical limitation; it gives the limitation a visual explanation. What might read as a broken render instead feels like intentional focus.</p>
          </div>
          <figure className="case-media case-media-focus">
            <img src="/images/looking-glass-unity/depth-of-field.gif" alt="Looking Glass display showing depth-of-field blur across several cubes" loading="lazy" />
            <figcaption>Focus directs attention while softening the view-to-view crosstalk that grows with depth.</figcaption>
          </figure>
        </section>

        <section className="case-section case-lighting">
          <p className="case-number">05 / Content guidance</p>
          <div className="case-section-copy">
            <h2>Materials needed to move with the viewer.</h2>
            <p>A light field is convincing when the image changes as someone shifts their head. In our demos, we leaned toward semi-gloss materials and controlled specular highlights so surfaces would catch light differently from each view. That changing reflection becomes a depth cue.</p>
            <p>We paired those materials with dynamic lighting and restrained backgrounds. The goal was not realism for its own sake; it was to give creators a repeatable way to make shape and depth legible from many positions around the display.</p>
          </div>
          <figure className="case-media case-media-lighting">
            <img src="/images/looking-glass-unity/dynamic-lighting.gif" alt="A reflective watch rotating as highlights move across its material" loading="lazy" />
            <figcaption>Moving highlights help a surface describe its form from multiple viewpoints.</figcaption>
          </figure>
        </section>

        <section className="case-section case-cursor">
          <p className="case-number">06 / Spatial interaction</p>
          <div className="case-section-copy">
            <h2>A 3D scene needed a cursor with a Z-axis.</h2>
            <p>The first version of the 3D Cursor was developed for Looking Glass Model Viewer, then adapted into the Unity plugin. It samples scene geometry so the pointer sits on the object beneath it, scales with the Hologram Camera, and can select something whether it appears in front of or behind the display plane.</p>
            <p>Combined with orbit controls, double left-click made the selected point the new center of rotation and focus. That small gesture solved two related problems at once: it told the system what the user cared about and repositioned the multi-view renderer around a meaningful depth.</p>
          </div>
          <CursorDiagram />
        </section>

        <section className="case-section case-takeaway">
          <p className="case-number">07 / Takeaway</p>
          <div className="case-section-copy">
            <h2>Designing the mental model was the product.</h2>
            <p>The rendering technology was only useful if creators could predict it. The plugin’s enduring interaction ideas all reduce conceptual distance: a camera you can see as a volume, focus you can place in the scene, a light field stored in a familiar file, and a cursor that acknowledges depth.</p>
            <div className="case-principles">
              <p><span>01</span>Make hidden system behavior spatial and visible.</p>
              <p><span>02</span>Preserve familiar workflows where the medium allows it.</p>
              <p><span>03</span>Turn unavoidable constraints into intentional aesthetics.</p>
            </div>
            <p className="case-links">Read the official <a href="https://lfdocs.lookingglassfactory.com/software/index">Unity Plugin documentation</a>, the <a href="https://lfdocs.lookingglassfactory.com/software/index/prefabs/hologram-camera">Hologram Camera guide</a>, the <a href="https://lfdocs.lookingglassfactory.com/keyconcepts/quilts">quilt format overview</a>, and the <a href="https://lfdocs.lookingglassfactory.com/software/index/prefabs/3d-cursor">3D Cursor guide</a>.</p>
          </div>
        </section>
      </article>
    </Layout>
  )
}

function Ect() {
  return <Layout><article className="essay project-detail"><p className="kicker">Game · MFA thesis</p><h1>Every Creeping Thing</h1><p className="lede">A game about embodying different animal species.</p><a className="button" href="https://alxdncn.itch.io/every-creeping-thing">Play the game <Arrow /></a><img src="/images/ect/ecttitle.png" alt="Every Creeping Thing title screen" /><div className="prose"><p>Challenging you to imagine the world from a perspective far removed from your own, it is a 3D game in three parts, each representing a unique creature’s viewpoint. Strange visual effects and unconventional controls ask the player simply to understand how to exist in a new, alien perspective.</p><img src="/images/thumbs/ect.png" alt="Underwater scene from Every Creeping Thing" /><p>Over the course of the game, the player moves from the perspective of a trout to a mayfly to a larva. It is a short, atmospheric experience that challenges the player to reconsider their relationship to the environment and the creatures they share it with.</p><img src="/images/ect/mayfly.png" alt="Mayfly perspective" /><p>Every Creeping Thing was my thesis project for my MFA at the NYU Game Center. After researching depictions of non-human animals as avatars, I tried to make a game that took a different approach.</p><img src="/images/ect/larva.png" alt="Larva perspective" /><p>Read more about its making in <a href="https://heyzine.com/flip-book/406aa8c48d.html#page/17">A MAZE magazine’s animals issue</a>.</p></div></article></Layout>
}

export default function App() {
  const path = window.location.pathname.toLowerCase()

  useEffect(() => {
    if (window.location.hash) {
      requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView({ block: 'start' }))
      return
    }
    window.scrollTo(0, 0)
  }, [path])

  if (path.endsWith('/portfolio.html')) return <Portfolio />
  if (path.endsWith('/about.html')) return <About />
  if (path.endsWith('/looking-glass-unity.html')) return <LookingGlassUnity />
  if (path.endsWith('/ect.html')) return <Ect />
  if (path.endsWith('/beyond-fair-use') || path.endsWith('/beyond-fair-use/') || path.endsWith('/beyond-fair-use/index.html')) return <BeyondFairUse />
  if (path.endsWith('/beyond-fair-use.html')) return <BeyondFairUse />
  if (path.endsWith('/games-biting-back.html')) return <GamesBitingBack />
  const essay = essays[path]
  if (essay) return <Essay essay={essay} />
  return <Home />
}
