import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import beyondFairUseText from './beyondFairUse.md?raw'
import gamesBitingBackText from './gamesBitingBack.md?raw'

const BonsaiScene = lazy(() =>
  import('./components/BonsaiScene').then(({ BonsaiScene: Scene }) => ({ default: Scene })),
)

const projects = [
  { title: 'Surely, AI Can', image: '/images/large/surelyaican.jpg', href: '/surely-ai-can.html', text: 'A parody AI benchmarking site that shows the surprising ways frontier models fail.' },
  { title: 'Parsem: AI Search Redesigned', image: '/images/large/parsem.png', href: '/parsem.html', text: 'AI search rebuilt for transparency: every part of each answer links to a real, visible source, giving credit back to the people who wrote it.' },
  { title: 'Every Creeping Thing', image: '/images/thumbs/ect.png', href: '/ect.html', text: 'A 3D game where the player sees the world from the perspective of different animals. Sound design by Seth S. Scott.' },
  { title: 'Standard Assets', image: '/images/large/standardassets.gif', video: '/images/large/standardassets.webm', poster: '/images/large/standardassets.poster.webp', href: 'https://alxdncn.itch.io/standard-assets', text: 'An experimental 3D game examining the environment package of Unity Standard Assets.' },
  { title: 'On Nature', image: '/images/thumbs/OnNatureGif.gif', video: '/images/thumbs/OnNatureGif.webm', poster: '/images/thumbs/OnNatureGif.poster.webp', href: 'https://alxdncn.itch.io/on-nature', text: 'A web game depicting an environment in different representational modes.' },
  { title: 'Space Kitty', image: '/images/thumbs/spacekitty.png', href: 'https://tafkaf.itch.io/space-kitty', text: 'A digital and physical game where players use their phone flashlights to protect a space kitty from dogliens. Collaboration with Karina Popp.' },
  { title: 'Small Song', image: '/images/thumbs/smallsong.png', href: 'https://alxdncn.itch.io/small-song', text: "A short interactive interpretation of A.R. Ammons's twelve-word poem, using the player's location and time to determine the sun and lighting." },
  { title: 'Flora', image: '/images/thumbs/flora.png', href: 'https://gamejolt.com/games/flora/54787', text: 'Help a small tree survive the seasons and grow to be a giant of the forest.' },
]

const professional = [
  { title: 'Looking Glass Unity Plugin', image: '/images/looking-glass-unity/unity-workflow-with-character.jpg', href: '/looking-glass-unity.html', text: 'A creator tool that translated light-field rendering into familiar Unity concepts: a volumetric camera, quilt capture, depth-aware focus, and 3D interaction.' },
  { title: 'Liteforms', image: '/images/large/liteforms-large.gif', video: '/images/large/liteforms-large.webm', poster: '/images/large/liteforms-large.poster.webp', href: '/liteforms.html', text: "A desktop application for talking to and creating holographic characters. A design exploration of embodied AI for Looking Glass displays, where I’m the product lead." },
  { title: 'Holographic Elemental', image: '/images/large/elemental-pixar.gif', video: '/images/large/elemental-pixar.webm', poster: '/images/large/elemental-pixar.poster.webp', href: 'https://blog.lookingglassfactory.com/thattimewewenttopixar/', text: 'For Pixar’s Elemental, I supported the team with visual design for bringing Ember and Wade to a Looking Glass display.' },
  { title: 'Bulgari Holographic Experience', image: '/images/large/OctoFinissimo-large.png', href: 'https://www.linkedin.com/posts/ennio-piccirillo_digital-storytelling-experience-activity-7028844964054806528-0Dqy/', text: 'A pop-up holographic experience in Rome showcasing the Octo Finissimo Ultra. I worked on the interaction and visual design.' },
  { title: 'Investing in Futures', image: '/images/large/InvestingInFuturesLarge.png', href: 'https://moreandmore.world/', text: 'A card game prompting players to imagine alternative global futures. I contributed to the game design for More&More Unlimited.' },
  { title: 'DESIGNxBOULDER', image: '/images/thumbs/designxboulder.png', href: 'https://www.bmoca.org/2016-2017-exhibitions/designxboulder', text: 'An interactive visualization of projects by Natalie Jeremijenko, displayed at the Boulder Museum of Contemporary Art in 2016.' },
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
  return <header className="site-header"><a className="wordmark" href="/"><span>Alex</span> Duncan</a><nav aria-label="Primary navigation"><a href="/#professional-work">Professional Work</a><a href="/#game-art-projects">Game/Art Projects</a><a href="/#writing">Writing</a><a href="/about.html">About</a></nav></header>
}

function Arrow() { return <span aria-hidden="true">↗</span> }

function MotionMedia({ src, poster, fallback, alt }) {
  const mediaRef = useRef(null)
  const [active, setActive] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const media = mediaRef.current
    if (!media) return
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setActive(!reducedMotion)
        observer.disconnect()
      },
      { rootMargin: '320px' },
    )
    observer.observe(media)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!active || !mediaRef.current) return
    mediaRef.current.play().catch(() => setFailed(true))
  }, [active])

  if (failed) return <img src={fallback} alt={alt} loading="lazy" decoding="async" />

  return <video ref={mediaRef} src={active ? src : undefined} poster={poster} muted loop playsInline autoPlay={active} preload="none" role="img" aria-label={alt} onError={() => setFailed(true)} />
}

function PatentPreviewArt() {
  return (
    <div className="patent-preview-art" role="img" aria-label="Abstract diagram representing three patent contributions">
      <div className="patent-preview-sheet">
        <span>US / SELECTED</span>
        <strong>03</strong>
        <small>INVENTIONS</small>
        <i></i><i></i><i></i>
      </div>
      <div className="patent-preview-volume"><span></span><span></span><span></span></div>
    </div>
  )
}

function ProjectGrid({ items }) {
  return <div className="project-grid">{items.map((p, i) => <article className="project" key={p.title} style={{ '--delay': `${i * 45}ms` }}><a className={`project-image${p.art === 'patents' ? ' project-image-patents' : ''}`} href={p.href}>{p.art === 'patents' ? <PatentPreviewArt /> : p.video ? <MotionMedia src={p.video} poster={p.poster} fallback={p.image} alt={`${p.title} project preview`} /> : <img src={p.image} alt={`${p.title} project preview`} loading="lazy" decoding="async" />}<span className="project-index">{String(i + 1).padStart(2, '0')}</span></a><div className="project-copy"><h3><a href={p.href}>{p.title} <Arrow /></a></h3><p>{p.text}</p></div></article>)}</div>
}

function SectionHead({ kicker, title, action }) {
  return <div className="section-head"><div><p className="kicker">{kicker}</p><h2>{title}</h2></div>{action && <a className="text-link" href={action.href}>{action.label} →</a>}</div>
}

function Layout({ children }) {
  return <><Header /><main>{children}</main><footer><p>Alex Duncan</p><p>Brooklyn, New York · <a href="mailto:alxdncn@gmail.com">alxdncn@gmail.com</a></p><p>Games, Technology, & Interactive Art</p></footer></>
}

function HeroBonsai() {
  const [seed] = useState(() => Math.floor(Math.random() * 0xffffffff) || 1)

  return (
    <div className="bonsai-hero" aria-hidden="true">
      <Suspense fallback={null}>
        <BonsaiScene seed={seed} branching={540} rootBranching={0} initialGrowthSteps={20} speed={0.6} paused={false} onStats={() => {}} />
      </Suspense>
    </div>
  )
}

function Home() {
  return <Layout><section className="hero"><HeroBonsai /><div className="hero-copy"><p className="hero-statement">I make games, interactive art, AI experiences, and holographic software.</p><p className="hero-note">Often exploring how technology changes our relationship with the natural world.</p></div></section><section id="professional-work"><SectionHead kicker="01 / Product & client work" title="Professional Work" /><ProjectGrid items={professional} /></section><section id="game-art-projects"><SectionHead kicker="02 / Independent work" title="Game / Art Projects" /><ProjectGrid items={projects} /></section><section id="writing"><SectionHead kicker="03 / Selected writing" title="Writing" /><div className="writing-list">{writing.map((w, i) => <a href={w.href} className="writing-row" key={w.title}><span>{String(i + 1).padStart(2, '0')}</span><h3>{w.title}</h3><p>{w.text}</p><Arrow /></a>)}</div></section><section className="contact"><p className="kicker">04 / Contact</p><h2>Questions, collaborations,<br />or just want to say hi?</h2><a className="button" href="mailto:alxdncn@gmail.com">Get in touch <Arrow /></a></section></Layout>
}

function About() {
  return <Layout><section className="about-intro"><SectionHead kicker="About" title="Alex Duncan" /></section><section className="prose about-grid"><div><p>I manage the software that powers the holographic displays made at <a href="https://lookingglassfactory.com">Looking Glass</a>. I grew up in Vancouver, Canada, did my MFA at the NYU Game Center, and enjoy writing and making weird digital experiences.</p><p>I like to hike, kayak, bird watch, play chess, and read speculative fiction.</p></div><div><p>My creative and critical work often centers on the way humans relate to non-human animals and the natural environment, the way natural spaces are depicted in digital media, and how novel technologies impact social structures.</p><p><a href="mailto:alxdncn@gmail.com">Email</a> · <a href="https://www.linkedin.com/in/alex-duncan-a3082a123/">LinkedIn</a></p></div></section></Layout>
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
    .filter(Boolean)

  return (
    <Layout>
      <article className="essay">
        <p className="kicker">Writing · Essay</p>
        <h1>{title}</h1>
        {subtitle && <p className="essay-subtitle"><em>{subtitle}</em></p>}
        <div className="prose">
          {blocks.map((block, index) => {
            const figure = block.match(/^!\[([^\]]*)\]\((\/images\/[^\s)]+)\)\n([\s\S]+)$/)
            if (figure) return (
              <figure className="essay-figure" key={index}>
                <a href={figure[2]} aria-label={`View full-size graphic: ${figure[1]}`}>
                  <img src={figure[2]} alt={figure[1]} loading="lazy" decoding="async" />
                </a>
                <figcaption>{renderInline(figure[3])}</figcaption>
              </figure>
            )
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

function LookingGlassUnity() {
  return (
    <Layout>
      <article className="case-study looking-glass-case">
        <header className="case-hero">
          <div className="case-hero-copy">
            <p className="kicker">Professional work · Looking Glass Factory</p>
            <h1>Looking Glass Unity Plugin</h1>
          </div>
          <figure className="case-hero-image">
            <img src="/images/looking-glass-unity/unity-workflow-with-character.jpg" alt="A Unity scene running on a laptop beside a Looking Glass display showing the same character" />
            <figcaption>A familiar Unity scene, previewed live as a group-viewable light field.</figcaption>
          </figure>
          <div className="case-hero-text">
            <p>Designing a camera, media format, and interaction model for a display where depth is part of the interface.</p>
            <p>The Looking Glass Unity Plugin turns an ordinary Unity scene into a live holographic application, image, or video for Looking Glass light-field displays.</p>
            <p><strong>My role was product lead.</strong> I worked with Kyle Appelgate, Albert Hwang, Carlos DaLomba, Vanilla Liu, Brandon Francis, and Shouvick Koley on the design and implementation of the plugin.</p>
          </div>
        </header>

        <section className="case-section case-opening">
          <p className="case-number">01 / Product premise</p>
          <div className="case-section-copy">
            <h2>A new category, inside an existing workflow.</h2>
            <p>We needed to make a new category of display and interaction (spatial light fields) legible to creators, while fitting into the workflows they already used. Porting an existing Unity project to Looking Glass needed to feel less like learning a new rendering system and more like adding a new kind of camera.</p>
            <p>A conventional screen shows one camera view to everyone. A Looking Glass renders dozens of horizontally offset perspectives (typically 45 to 100) and its optics direct those views into different angles. As people move across the viewing cone, each eye receives a slightly different perspective. The resulting parallax makes the image appear three-dimensional to multiple viewers at once, without head tracking or a headset.</p>
            <p>The plugin automated that multiview rendering while preserving Unity’s normal scene, component, preview, and build paradigms. It was our first engine plugin and became a template for later integrations, but the exchange of ideas also ran in the other direction. Christian Stolze’s community-built <a href="https://github.com/regcs/AliceLG">Alice/LG Blender add-on</a> first developed the conventional camera-style transform approach that we later incorporated into Unity as Camera Transform Mode.</p>
          </div>
        </section>

        <section className="case-section case-quilts">
          <p className="case-number">02 / Multiview media</p>
          <div className="case-section-copy">
            <h2>Quilts made the light field inspectable and portable.</h2>
            <p>We developed the quilt as a simple way to store all of that multiview data. Every perspective is tiled into one frame, ordered from the leftmost view at the bottom-left to the rightmost view at the top-right. The final light-field shader then uses the display’s calibration to interleave those views for the optics.</p>
            <p>The format made a complex render visible at a glance, easy to debug, and portable between tools. Just as importantly, a quilt is not a proprietary media container: it can be saved as a PNG, JPG, GIF, MP4, MOV, or WebM. A compact filename convention records its grid and aspect ratio, so specialized 3D data can move through familiar storage, editing, playback, and web pipelines.</p>
          </div>
          <QuiltDiagram />
        </section>

        <section className="case-section case-camera">
          <p className="case-number">03 / Camera model</p>
          <div className="case-section-copy">
            <h2>The camera became a visible volume of space.</h2>
            <p>The Hologram Camera’s box gizmo represents the visual space available inside the physical display. Instead of hiding the optics behind parameters, it gives creators a volume they can position around their content and immediately compare with the connected Looking Glass.</p>
            <p>In <em>Volume mode</em>, the display is modeled as a physical window into a bounded scene. The camera orbits around the volume’s center, while <em>Size</em> expands or contracts the visible range around the focal plane without losing the framing of the subject. This is the most direct mental model of the hardware.</p>
            <p><em>Camera mode</em> behaves more like a conventional 2D camera: its pivot sits at the central perspective and its focal plane is an adjustable, animatable parameter between the near and far clipping regions. That made the plugin much more natural for animators and cinematic workflows. A separate depthiness control could then expand or compress perceived depth without unexpectedly changing field of view or focus.</p>
          </div>
          <figure className="case-media case-media-wide">
            <img src="/images/looking-glass-unity/camera-volume.gif" alt="Unity camera-volume gizmo with a model moving through the focal plane" loading="lazy" />
            <figcaption>The green box communicates the capture volume; the central plane is the crispest point in the light field.</figcaption>
          </figure>
        </section>

        <section className="case-section case-framing">
          <p className="case-number">04 / Framing & materiality</p>
          <div className="case-section-copy">
            <h2>Optical constraints became compositional tools.</h2>
            <p>The zero-parallax plane is where all rendered views converge, analogous to the physical surface of the display. Content placed there appears crispest. As geometry moves farther in front of or behind it, view-to-view crosstalk becomes more visible and can read as ghosting.</p>
            <p>We aligned depth of field with that focal plane so off-plane content fell into an intentional photographic blur. We also encouraged creators to use backdrops that receive cast shadows. Those shadows ground objects inside the volume and make them read as more three-dimensional, especially when the display is filmed. This was an important consideration when most people first encountered the product through online video.</p>
            <p>Material design supplied another set of depth cues. Semi-gloss surfaces, specular highlights, and small faults or scratches catch the light differently from view to view. As a person moves, those shifting reflections reveal curvature, texture, and materiality in a way a uniformly matte surface cannot.</p>
          </div>
          <div className="case-media-pair">
            <figure className="case-media">
              <MotionMedia src="/images/looking-glass-unity/depth-of-field.webm" poster="/images/looking-glass-unity/depth-of-field.poster.webp" fallback="/images/looking-glass-unity/depth-of-field.gif" alt="Looking Glass display showing depth-of-field blur across several cubes" />
              <figcaption>Depth of field makes off-plane crosstalk feel like intentional focus.</figcaption>
            </figure>
            <figure className="case-media">
              <MotionMedia src="/images/looking-glass-unity/dynamic-lighting.webm" poster="/images/looking-glass-unity/dynamic-lighting.poster.webp" fallback="/images/looking-glass-unity/dynamic-lighting.gif" alt="A reflective watch rotating as highlights move across its material" />
              <figcaption>Moving highlights help a surface describe its form across viewpoints.</figcaption>
            </figure>
          </div>
        </section>

        <section className="case-section case-cursor">
          <p className="case-number">05 / Spatial interaction</p>
          <div className="case-section-copy">
            <h2>Interaction needed to acknowledge depth.</h2>
            <p>Leap Motion hand tracking let us build some of our most immediately magical demos: reaching into a volume, manipulating product models without a controller, and drawing directly in 3D. The same Unity integration later supported experiences such as <a href="https://blog.lookingglassfactory.com/infiniti-hologram-experiences-as-naias-2019/">INFINITI’s interactive car display</a> and Looking Glass <a href="https://blog.lookingglassfactory.com/looking-glass-experiments/">Air Writing</a>.</p>
            <p>But precise desktop navigation still mattered. A normal cursor only describes X and Y on a plane; in a light field, the Z position of the target is critical to comprehension and selection. The 3D Cursor, first developed for Looking Glass Model Viewer and later adapted for Unity, samples scene geometry and depth-snaps to the surface beneath the pointer so it appears attached to the intended object.</p>
            <p>Double left-click then turns that depth into an action: it moves the selected point to the center of orbit and refocuses the renderer there. One familiar gesture communicates what the user cares about, brings that depth to the zero-parallax plane, and makes the next navigation step predictable.</p>
          </div>
          <figure className="cursor-figure">
            <MotionMedia src="/images/looking-glass-unity/desk-turbine.webm" poster="/images/looking-glass-unity/desk-turbine.poster.webp" fallback="/images/looking-glass-unity/desk-turbine.gif" alt="A mechanical assembly displayed as a hologram on a desk while a person controls it" />
            <figcaption>Spatial interaction works best when selection, focus, and the depth of the object agree.</figcaption>
          </figure>
        </section>

        <section className="case-section case-takeaway">
          <p className="case-number">06 / Takeaway</p>
          <div className="case-section-copy">
            <h2>Designing the mental model was the product.</h2>
            <p>The Unity Plugin succeeded by translating a specialized optical system into concepts creators could see and reason about: a camera represented as a volume, a focal plane that can be composed and animated, multiview data stored in ordinary media files, and interaction that treats depth as a first-class part of the interface. Those ideas made it easier to port existing work while also giving creators a vocabulary for what was genuinely new about the display.</p>
          </div>
          <figure className="case-closing-media">
            <MotionMedia src="/images/looking-glass-unity/jet-engine.webm" poster="/images/looking-glass-unity/jet-engine.poster.webp" fallback="/images/looking-glass-unity/jet-engine.gif" alt="A jet engine model in a Looking Glass display being explored with hand tracking" />
            <figcaption>Tools and interaction patterns converged around a simple goal: make spatial content understandable by looking and acting.</figcaption>
          </figure>
          <p className="case-links">See the official <a href="https://lfdocs.lookingglassfactory.com/software/index">Unity Plugin documentation</a>, <a href="https://lfdocs.lookingglassfactory.com/software/index/prefabs/hologram-camera">Hologram Camera guide</a>, <a href="https://lfdocs.lookingglassfactory.com/keyconcepts/quilts">quilt format overview</a>, <a href="https://lfdocs.lookingglassfactory.com/software/index/prefabs/3d-cursor">3D Cursor guide</a>, and <a href="https://github.com/regcs/AliceLG">Alice/LG Blender add-on</a>.</p>
        </section>
      </article>
    </Layout>
  )
}

function Parsem() {
  return (
    <Layout>
      <article className="case-study parsem-case">
        <header className="case-hero">
          <div className="case-hero-copy">
            <p className="kicker">Independent project · AI search</p>
            <h1>Parsem</h1>
          </div>
          <figure className="case-hero-image">
            <img src="/images/large/parsem.png" alt="Parsem answer with the cited Wikipedia page embedded directly beneath one section" />
            <figcaption>An answer stays visibly connected to the page that supports it.</figcaption>
          </figure>
          <div className="case-hero-text">
            <p>AI search redesigned to keep human sources in view.</p>
            <p>Parsem is an AI-powered search tool that highlights original reporting, makes generated text verifiable in the interface, and gives readers direct paths back to the people and pages informing an answer.</p>
            <div className="case-hero-actions"><a className="button" href="https://www.parsemsearch.app/">Try Parsem <Arrow /></a></div>
          </div>
        </header>

        <section className="case-section case-opening">
          <p className="case-number">01 / Core vision</p>
          <div className="case-section-copy">
            <h2>AI chatbots obscure sources. In Parsem, I tried to bring sources to the fore.</h2>
            <p>Answer engines are convenient because they compress the work of finding and comparing information. That compression also hides where claims came from and removes the reason to visit the sites that produced them. Parsem asks whether an AI answer can preserve the speed of synthesis while making the underlying web more present, legible, and worth visiting.</p>
            <p>Instead of presenting one seamless voice, Parsem breaks an answer into discrete sections. Each section is grounded in a single source, accompanied by a direct citation and a visible excerpt and, where the source permits it, an embedded instance of the live page itself. The AI supplies structure; the source remains the object of attention.</p>
          </div>
        </section>

        <section className="case-section case-wash">
          <p className="case-number">02 / Theoretical foundation</p>
          <div className="case-section-copy">
            <h2>The interface grew out of a governance question.</h2>
            <p>Parsem began after I completed <a href="/beyond-fair-use">Beyond Fair Use: Sustaining Journalism in the Age of AI</a>, my final paper for the BlueDot Impact AI Governance course. The paper argues that journalism is critical infrastructure in two key ways: it supports democratic accountability, and it supplies the timely, factual, human-generated material on which useful AI systems depend.</p>
            <p>That infrastructure is already fragile. Search and social platforms have concentrated attention while publisher traffic and revenue have declined. AI answer engines intensify the pattern by ingesting reporting, returning a synthesized response, and often satisfying the user before a click occurs. If the institutions producing trustworthy information become economically unsustainable, both public knowledge and future AI systems lose an essential input.</p>
            <p>The paper considers licensing markets, collective bargaining frameworks, and public funding as policy responses. Parsem operates at a different scale. It asks what responsibility the product interface itself can take on, before or alongside regulation.</p>
          </div>
        </section>

        <section className="case-section">
          <p className="case-number">03 / Interface problem</p>
          <div className="case-section-copy">
            <h2>Most chatbot answers make provenance feel secondary.</h2>
            <p>The dominant chat interface encourages users to read an answer as a single authoritative object. Even when retrieval is involved, citations are often pushed into small footnotes, leaving provenance secondary to the synthesized response.</p>
            <p>Several pages may be compressed into one answer, making it difficult to tell which source supports each claim.</p>
            <p>When a chatbot relies on its training data, a claim may come from something it read online, but the response provides no recoverable author, publication, or context. The source, along with any bias or perspective it carried, is made invisible.</p>
            <p>Different writers’ positions can then be flattened into one neutral-sounding composite voice, concealing disagreement and making the system’s synthesis appear more objective than it is.</p>
            <p>Chatbot answers are also designed to be endpoints. News publishers depend on people following links to their sites for advertising and subscription revenue, but AI summaries often satisfy a query before a click occurs. <a href="https://www.forbes.com/sites/rashishrivastava/2025/03/03/openai-perplexity-ai-search-traffic-report/">Forbes reported</a> that ChatGPT and Perplexity reduced click-through rates by 96% compared with Google Search. If that pattern continues, publishers lose the traffic that helps fund reporting, placing the economic ecosystem of journalism under greater strain.</p>
          </div>
        </section>

        <section className="case-section case-intervention">
          <p className="case-number">04 / Critical intervention</p>
          <div className="case-section-copy">
            <h2>Integrate source attribution into the experience.</h2>
            <p>Parsem treats provenance as an interaction-design requirement. Every answer section uses exactly one source, so the relationship between claim and evidence remains comprehensible. The title and link are kept visible, and a supporting quotation lets the reader inspect the relevant language without hunting through a citation drawer.</p>
            <p>An embedded iframe gives the source substantial visual space inside the answer flow. A reader can encounter the publisher’s framing, authorship, images, and surrounding context without leaving the search, then open the original page directly at any point. By giving the source visual prominence and providing repeated paths to open it, the interface encourages click-through and aims to return more traffic to the publisher. Not every site permits embedding, so Parsem preserves an explicit link and excerpt when the iframe is unavailable.</p>
            <p>This does not solve the economics of publishing by itself. It is a critical design intervention: a working demonstration that an AI product can choose to direct attention outward, expose the seams in its synthesis, and treat sources as participants rather than raw material.</p>
          </div>
        </section>

        <section className="case-section case-takeaway">
          <p className="case-number">05 / Takeaway</p>
          <div className="case-section-copy">
            <h2>Responsible answer engine design should highlight its sources.</h2>
            <p>Parsem reframes AI search as a layer of navigation across the web, not a replacement for it. Its central proposition is simple: the convenience of an answer and the visibility of human knowledge do not have to be opposing product goals.</p>
          </div>
          <p className="case-links">Explore <a href="https://www.parsemsearch.app/">the live app</a>, read <a href="https://www.parsemsearch.app/about">the Parsem about page</a>, or see the full paper, <a href="/beyond-fair-use">Beyond Fair Use</a>.</p>
        </section>
      </article>
    </Layout>
  )
}

const surelyPrompts = [
  'Write a short concrete poem about androids that has the shape of a person. Draw it in plain-text ASCII.',
  'A person is holding a compass flat in their open palm. You are viewing the compass from directly above, and north is at the top of the image. The person is facing toward the top of the compass image. What direction is the person facing?',
  'Create a video where a person rapidly and neatly stacks ten plates. Keep the camera steady - no cuts or jumps.',
  'Create an image of a happy new year card for this coming year. Show the year on the card.',
  'Create a map of Europe with all the countries labeled.',
  'Create a video showing a person talking. Halfway through the video, rotate the camera 90 degrees clockwise while filming the same content.',
  'Draw an upside down face where the eyes and mouth are inverted relative to the head orientation, demonstrating the Thatcher Effect.',
  'Create a video that shows a basketball bouncing from the left side of the scene to the right side of the scene.',
  'Create a video of the scoring area of a curling sheet, where a curling stone bounces off a rival stone to score a point.',
  'Create an image of a set of cards showing all the values from 2 to ace, in the suit of hearts.',
  'What time does the provided image show? Provide your response in HH:MM:SS format.',
  "What's wrong with this image?",
  'Finish the below sentence. Provide only one response and no explanation: "David loves ants. David\'s favorite food is..."',
  'Create an image with 5 vertical red lines and 5 horizontal green lines.',
  'Write a short story (between 250 and 400 words) without using the letter "e".',
  "Create a video of a person tying their shoelace in a bow. Keep the camera zoomed in on the front of the shoe - don't pan or move the camera.",
]

function SurelyAiCan() {
  return (
    <Layout>
      <article className="case-study surely-case">
        <header className="case-hero">
          <div className="case-hero-copy">
            <p className="kicker">Independent project · AI benchmark</p>
            <h1>Surely, AI Can…</h1>
          </div>
          <figure className="case-hero-image">
            <img src="/images/large/surelyaican.jpg" alt="Two image models failing to draw exactly five vertical red lines and five horizontal green lines" />
            <figcaption>A small counting task becomes a revealing image-generation benchmark.</figcaption>
          </figure>
          <div className="case-hero-text">
            <p>A showcase for the surprising and often hilarious ways frontier AI models fail at tasks that feel like they should be doable.</p>
            <p>The space moves quickly. In the six months after launch, models learned to complete several examples that originally broke them. Yet unexpected failures remain: even newer models can still finish “David loves ants. David’s favorite food is…” with <em>“Ants.”</em></p>
            <div className="case-hero-actions"><a className="button" href="https://surelyaican.com/">Try the app <Arrow /></a></div>
          </div>
        </header>

        <section className="case-section case-opening">
          <p className="case-number">01 / Why make it</p>
          <div className="case-section-copy">
            <h2>Frontier models are highly capable but can still fail in unexpected and funny ways.</h2>
            <p>I use AI tools often, including to make this project. They are extraordinarily powerful. But the public story around frontier models can turn that power into a vague promise of near-infallibility, especially for people who do not spend enough time with the systems to encounter their quirks.</p>
            <p>Ambitious, precise, or simply unusual tasks expose a different picture. Models fail often, and the failure may not resemble anything a human would have predicted. Surely, AI Can makes those moments enjoyable and legible. Humor creates room to inspect the gap between a model’s broad fluency and its uneven grasp of constraints, space, continuity, and meaning.</p>
            <p>The project was directly inspired by Brian Moore’s <a href="https://clocks.brianmoore.com/">AI World Clocks</a>, alongside Clock Bench and OuLiBench. Each turns a compact, intuitive task into a window onto model behavior.</p>
          </div>
          <figure className="case-media case-media-wide screenshot-frame">
            <img src="/images/large/surelyaican.jpg" alt="Surely, AI Can comparison interface showing two generated line-pattern images" loading="lazy" />
            <figcaption>Visitors inspect the same prompt across models, vote “can” or “can’t,” and contribute to a comparative leaderboard.</figcaption>
          </figure>
        </section>

        <section className="case-section case-wash">
          <p className="case-number">02 / Modalities & system</p>
          <div className="case-section-copy">
            <h2>One interface, four very different kinds of failure.</h2>
            <p>The app tests text, vision, image generation, and video generation. I built it with <a href="https://openrouter.ai/">OpenRouter</a> and <a href="https://fal.ai/">fal.ai</a>, which made it straightforward to switch models as the frontier changed while keeping the prompt and evaluation experience consistent.</p>
          </div>
        </section>

        <section className="case-section">
          <p className="case-number">03 / What the failures reveal</p>
          <div className="case-section-copy">
            <h2>The hardest part is often the relationship between simple things.</h2>
            <p>Across modalities, the failures are rarely about recognizing the individual ingredients. They appear when a model has to keep those ingredients in an exact relationship over space, time, or language.</p>
          </div>
          <div className="finding-grid">
            <article><p className="diagram-label">Video · object relations</p><h3>Ten plates will not stay ten plates.</h3><p>In the stacking task, plates merge, disappear, multiply, or jump into place because the model has to preserve identity and contact through rapid motion.</p></article>
            <article><p className="diagram-label">Video · repeated motion</p><h3>A bounce is a pattern through time.</h3><p>A basketball crossing a frame requires the ball to spin and interact with the environment in a consistent repeated pattern. That pattern often drifts or breaks.</p></article>
            <article><p className="diagram-label">Image · visual ordering</p><h3>Simple ordering of visual elements is difficult.</h3><p>Five red vertical and five green horizontal lines expose weak counting and orientation; a full hearts suit exposes failures in ordered visual sequences.</p></article>
            <article><p className="diagram-label">Vision · directional meaning</p><h3>Seeing an arrow is not reading it.</h3><p>Clocks and compasses require spatial features to be interpreted as a semantic relation, not merely described. Vision models often fail at this.</p></article>
            <article><p className="diagram-label">Text · unusual rules</p><h3>Fluency pulls against constraint.</h3><p>A 250-word lipogram (i.e. a block of text that does not use the letter E) requires the model to maintain a letter-level prohibition while generating coherent prose. This is an awkward rule for token-based generation.</p></article>
            <article><p className="diagram-label">Text · expectation capture</p><h3>The nearest association can win.</h3><p>When an LLM is asked to finish the sentence “David loves ants. David’s favorite food is…” many models, including modern frontier models, still respond with “ants.” The opening sentence strongly primes that response, overpowering the ordinary inference that a question about David’s favorite food should be answered with something he eats.</p></article>
          </div>
        </section>

        <section className="case-section prompt-catalog">
          <p className="case-number">04 / Prompt catalog</p>
          <div className="case-section-copy">
            <h2>Sixteen small tests of what “surely” means.</h2>
            <p>The prompts are intentionally understandable without a technical benchmark. A visitor can look at an output and form a judgment immediately. The challenges presented to the AI models are as follows:</p>
          </div>
          <ol className="prompt-list">
            {surelyPrompts.map((prompt, index) => <li key={prompt}><span>{String(index + 1).padStart(2, '0')}</span><p>{prompt}</p></li>)}
          </ol>
        </section>

        <section className="case-section case-takeaway">
          <p className="case-number">05 / A moving benchmark</p>
          <div className="case-section-copy">
            <h2>The latest models can now pass some of these tests, but surprises remain.</h2>
            <p>This collection is partly a time capsule. Tasks that seemed impossible at launch may become routine a few releases later, and that progress matters. The point is not to freeze a model at its weakest moment. It is to keep a healthy distance from claims that scale or fluency have made these systems universally reliable.</p>
            <p>The exact edge keeps moving. There will still be a next plate, clock, letter, or ant that shows how strange that edge can be.</p>
          </div>
          <p className="case-links">Visit <a href="https://surelyaican.com/">Surely, AI Can</a>, read its <a href="https://surelyaican.com/about">about page</a>, or explore the inspiration, <a href="https://clocks.brianmoore.com/">AI World Clocks</a>.</p>
        </section>
      </article>
    </Layout>
  )
}

function EveryCreepingThing() {
  return (
    <Layout>
      <article className="case-study ect-case">
        <header className="case-hero">
          <div className="case-hero-copy">
            <p className="kicker">Independent game · MFA thesis</p>
            <h1>Every Creeping Thing</h1>
          </div>
          <figure className="case-hero-image">
            <img src="/images/ect/ecttitle.png" alt="Every Creeping Thing title screen over an abstract turquoise underwater scene" />
            <figcaption>Three lives, three perceptual systems, and no neutral point of view.</figcaption>
          </figure>
          <div className="case-hero-text">
            <p>A short 3D game about the difficulty of embodying another species.</p>
            <p>Players move through the perspectives of a trout, a mayfly, and a maggot. Unfamiliar senses and bodily controls turn the basic act of existing in the world into the game’s central challenge.</p>
            <p><strong>Sound design by Seth S. Scott.</strong></p>
            <div className="case-hero-actions"><a className="button" href="https://alxdncn.itch.io/every-creeping-thing">Play on itch.io <Arrow /></a></div>
          </div>
        </header>

        <section className="case-section case-opening">
          <p className="case-number">01 / Design premise</p>
          <div className="case-section-copy">
            <h2>Playing as an animal often feels suspiciously human.</h2>
            <p>Games routinely let us become badgers, rats, fish, or fantastical creatures while leaving the player’s basic way of perceiving and moving unchanged. Conventional cameras and WASD controls make these bodies easy to inhabit, but that convenience can erase the very differences that make another animal’s experience unknowable.</p>
            <p>Animal avatars then become frictionless vessels for human goals. Every Creeping Thing started from the opposite question: what if embodiment were not a means to an objective, but the entire subject of play? The game deliberately makes perception, movement, and orientation strange enough that players have to notice the distance between their own body and the simulated one.</p>
          </div>
        </section>

        <section className="case-section case-wash">
          <p className="case-number">02 / Seeing things anew</p>
          <div className="case-section-copy">
            <h2>Each world begins with a different sensory problem.</h2>
            <p>The maggot has no eyes, so navigation happens almost entirely through luminous trails that translate smell into an image. Light itself becomes an aversive signal, represented by a rising, high-pitched whine. The mayfly’s compound eyes are interpreted as a disorienting 360-degree field of view. The trout’s underwater vision, scale, and movement establish another perceptual frame again.</p>
            <p>These effects are not claims to reproduce what another species “really” experiences. They are speculative estrangement devices—ways to interrupt the invisible assumption that a normal game camera is a neutral view of the world.</p>
          </div>
          <div className="case-media-pair ect-media-pair">
            <figure className="case-media">
              <img src="/images/thumbs/ect.png" alt="Underwater trout view rendered in saturated green and blue" loading="lazy" />
              <figcaption>The trout stage turns swimming and orientation into physical discovery.</figcaption>
            </figure>
            <figure className="case-media">
              <img src="/images/ect/mayfly.png" alt="Every Creeping Thing mayfly stage with a distorted panoramic field of view" loading="lazy" />
              <figcaption>The mayfly stage expands vision into an unfamiliar panoramic space.</figcaption>
            </figure>
          </div>
        </section>

        <section className="case-section">
          <p className="case-number">03 / Bodies playing bodies</p>
          <div className="case-section-copy">
            <h2>The mouse became a small physical performance.</h2>
            <p>Early versions made movement deliberately difficult, taking inspiration from QWOP’s ability to keep both the player’s body and the avatar’s body present in the mind. In testing, however, confusion could become stasis: instead of productively struggling, players simply sat still.</p>
            <p>The final controls preserve the bodily analogy while making motion discoverable. Moving the mouse side to side flaps the trout’s tail. Clicking alternates the mayfly’s wings. Pulling the mouse back and forth shimmies the maggot forward. The action feels unusual, but each gesture has a relationship to the form of locomotion it produces.</p>
            <p>This tension—between reflective difficulty and unreadable friction—became the core design problem. The game needed enough resistance to make embodiment noticeable, but enough response to let experimentation become play.</p>
          </div>
          <div className="gesture-strip" aria-label="Control gestures for the three animal stages">
            <article><span>↔</span><p><strong>Trout</strong><br />sweep the tail</p></article>
            <article><span>◒ ◓</span><p><strong>Mayfly</strong><br />alternate wings</p></article>
            <article><span>↕</span><p><strong>Maggot</strong><br />contract and extend</p></article>
          </div>
        </section>

        <section className="case-section case-ecology">
          <p className="case-number">04 / Beyond “man versus nature”</p>
          <div className="case-section-copy">
            <h2>The environment is something to understand, not conquer.</h2>
            <p>Many games frame wilderness as an obstacle course to survive and dominate—even when the avatar is itself an animal. Every Creeping Thing avoids strict win and lose states. Its spaces still contain attraction, aversion, food, and danger, but these are communicated through sensory qualities rather than a checklist of objectives.</p>
            <p>Proteus was an important model: it rewards attention through the pleasure of discovering a sight or sound rather than points. Combined with the bodily friction of QWOP and the “smellovision” of Dog’s Life, that approach produced a game where learning how to be in a space matters more than mastering it.</p>
          </div>
          <figure className="case-media case-media-wide ect-wide-media">
            <img src="/images/ect/larva.png" alt="Maggot stage in Every Creeping Thing with bright sensory trails against darkness" loading="lazy" />
            <figcaption>The eyeless maggot follows translated sensory trails rather than a conventional visual path.</figcaption>
          </figure>
        </section>

        <section className="case-section case-takeaway">
          <p className="case-number">05 / Making & reflection</p>
          <div className="case-section-copy">
            <h2>Disorientation only works when it leaves room to learn.</h2>
            <p>Every Creeping Thing was my thesis at the NYU Game Center. It grew from research into how non-human avatars can reinforce human-centered ideas about perception, control, and the environment. The project’s messy development taught me that critical discomfort cannot be separated from usability: players need enough feedback to turn confusion into curiosity.</p>
            <p>I wrote about that process—including the playtests that failed, the controls that changed, and the nervousness of showing a maggot simulator in public—in “Finding Wriggle Room” for A MAZE Magazine’s animal issue.</p>
          </div>
          <p className="case-links"><a href="https://alxdncn.itch.io/every-creeping-thing">Play Every Creeping Thing</a> or read <a href="https://heyzine.com/flip-book/406aa8c48d.html#page/17">Finding Wriggle Room: How I Made a Maggot Simulator</a>.</p>
        </section>
      </article>
    </Layout>
  )
}

function Liteforms() {
  return (
    <Layout>
      <article className="case-study liteforms-case">
        <header className="case-hero">
          <div className="case-hero-copy">
            <p className="kicker">Professional work · Looking Glass Factory</p>
            <h1>Liteforms</h1>
          </div>
          <figure className="case-hero-image">
            <MotionMedia src="/images/large/liteforms-large.webm" poster="/images/large/liteforms-large.poster.webp" fallback="/images/large/liteforms-large.gif" alt="Two people speaking with an animated rabbit character in a wall-mounted Looking Glass display" />
            <figcaption>The original desktop Liteforms app brought voice-driven AI characters into Looking Glass displays.</figcaption>
          </figure>
          <div className="case-hero-text">
            <p>Designing a desktop application for talking to and creating holographic characters.</p>
            <p>The original Liteforms paired conversational AI with animated 3D characters on Looking Glass displays. It explored what changes when a chatbot has a voice, a personality, a body, and a shared physical presence.</p>
            <p><strong>My role was product lead.</strong> This project summary covers the original desktop product. A new browser-first version is now in alpha, open source, and available to try.</p>
            <div className="case-hero-actions"><a className="button" href="https://liteforms.lookingglassfactory.com/">Try the new alpha <Arrow /></a></div>
          </div>
        </header>

        <section className="case-section case-opening">
          <p className="case-number">01 / Product premise</p>
          <div className="case-section-copy">
            <h2>What if a chatbot felt present in the room?</h2>
            <p>Most AI agents put intelligence behind a text input and scrolling chat history. Liteforms began with a different interaction model: speak naturally, hear a character answer, and watch that character react inside a group-viewable 3D display. No headset and no typing were required.</p>
            <p>The hologram was not just decoration around a language model. Eye movement, idle motion, turn-taking, voice, and expression all shaped the perceived character. Because multiple people could see and address the same Liteform, the experience could become social: a shared encounter with a digital personality rather than a private tool on a phone.</p>
            <p>At launch in 2023, Liteforms included three distinct characters: Uncle Rabbit, Little Inu, and Android Andi. It supported Looking Glass displays as well as an ordinary 2D window, and was one of the first interactive AI avatar applications built around modern frontier large language models.</p>
          </div>
        </section>

        <section className="case-section case-wash">
          <p className="case-number">02 / Character builder</p>
          <div className="case-section-copy">
            <h2>A useful character is more than an avatar plus a prompt.</h2>
            <p>The product evolved from a set of authored characters into a no-code creation tool. Users could define a name and pronouns, write or refine a persona, choose among voice presets, select or create an avatar, place it in an environment, and upload knowledge for a more specific role.</p>
            <p>Those choices form one system. A confident visual character paired with a hesitant voice feels incoherent; an elaborate backstory without scoped knowledge produces personality without usefulness. The builder made each layer independently editable while keeping a live conversation close at hand for testing.</p>
          </div>
        </section>

        <section className="case-section">
          <p className="case-number">03 / Conversation as animation</p>
          <div className="case-section-copy">
            <h2>A responsive character required a carefully architected technology stack.</h2>
            <p>A spoken turn moved through several systems: microphone input became text, a language model produced a response, text-to-speech generated the voice, and the application synchronized mouth movement, expression, and character state before rendering the result as a light field.</p>
            <p>Certain interaction priorities came to the fore over the course of testing. Delays that are tolerable in a text box feel awkward when a character appears to be listening. Without clear states, the user cannot tell whether it heard them, is thinking, or has stopped. The product therefore needed to communicate attention and progress through sound and motion while maintaining the sense of a responsive personality.</p>
          </div>
        </section>

        <section className="case-section case-presence">
          <p className="case-number">04 / Characters with a job</p>
          <div className="case-section-copy">
            <h2>Relevant information is important to business, but so is personality.</h2>
            <p>Liteforms was built for personal experimentation as well as retail, events, out-of-home installations, and location-based entertainment. Business applications needed characters grounded in relevant information, but useful answers alone were not enough to create a memorable interaction.</p>
            <p>At Blender Conference LA, Android Andi was prepared with the event schedule, speakers, and local details. Attendees could ask for recommendations and receive a tailored itinerary in Andi’s established voice. Andi could serve as a host and guide while retaining an authored identity.</p>
            <p>For <a href="https://www.linkedin.com/posts/lynguyenfrm_accenture-genai-liteforms-activity-7102433886546116608-dvcZ" target="_blank" rel="noopener noreferrer">Accenture’s activation at the 2023 TOUR Championship in Atlanta</a>, we created Felix the Phoenix, a holographic character that could answer questions about Accenture, generative AI, Atlanta, PGA tee times, and player profiles. Felix made practical event information conversational and easy to access.</p>
            <p>The interaction also needed to be fun. When visitors asked Felix about golf, a golf cart and other props could appear in the scene, with character animations making the response feel more alive. These moments showed how relevant knowledge and entertaining presentation could reinforce one another in a business setting.</p>
            <p>The design opportunity was not to pretend that the model was a person. It was to use the familiar tools of character design, including voice, movement, setting, and point of view, to make access to information warmer, more memorable, and shared.</p>
          </div>
          <figure className="case-media case-media-wide liteforms-media">
            <MotionMedia src="/images/large/liteforms-large.webm" poster="/images/large/liteforms-large.poster.webp" fallback="/images/large/liteforms-large.gif" alt="Uncle Rabbit speaking to visitors through a Looking Glass display" />
            <figcaption>Embodiment changes a chatbot from a private utility into a shared encounter.</figcaption>
          </figure>
        </section>

        <section className="case-section case-alpha">
          <p className="case-number">05 / Open-source alpha</p>
          <div className="case-section-copy">
            <h2>Liteforms is returning as a browser-first project.</h2>
            <p>The new alpha moves character creation and conversation to the web. It renders VRM avatars in real time, supports speech input and output, and works with Looking Glass through WebXR. Users can run browser-local language, transcription, and voice models or connect external providers.</p>
            <p>The project is open source and designed to work without a required hosted account system. That makes the underlying character stack more inspectable, adaptable, and useful to developers who want to experiment with their own providers, models, and avatars.</p>
          </div>
          <div className="alpha-links">
            <a href="https://liteforms.lookingglassfactory.com/"><span>Live alpha</span><strong>Open Liteforms Web <Arrow /></strong></a>
            <a href="https://github.com/Looking-Glass/liteforms-web"><span>Source code</span><strong>View on GitHub <Arrow /></strong></a>
          </div>
        </section>

        <section className="case-section case-takeaway">
          <p className="case-number">06 / Takeaway</p>
          <div className="case-section-copy">
            <h2>Embodied AI is an interaction-design problem.</h2>
            <p>Liteforms showed that adding a body to a chatbot raises the standard for coherence. Language, latency, voice, animation, spatial rendering, and authored personality all have to agree. When they do, a conversation can feel less like querying a service and more like meeting a character that belongs in the space.</p>
            <p>This change in interaction modality also creates risks alongside its potential applications and benefits. A character with a body and voice may earn trust too easily, encouraging cognitive over-reliance or making generated information feel more authoritative than it is. As we continue to pursue embodied AI applications, we are also investigating the safeguards needed to bring them to market responsibly.</p>
          </div>
          <p className="case-links">Read the <a href="https://blog.lookingglassfactory.com/introducing-liteforms/">original Liteforms announcement</a>, explore <a href="https://liteforms.lookingglassfactory.com/">the new alpha</a>, or inspect <a href="https://github.com/Looking-Glass/liteforms-web">the open-source project</a>.</p>
        </section>
      </article>
    </Layout>
  )
}

function PatentHeroGraphic() {
  return (
    <div className="patent-hero-graphic" role="img" aria-label="Three diagrams representing content formatting, a conversational character, and layered 2D and 3D displays">
      <div className="patent-hero-cell patent-hero-content">
        <span className="patent-diagram-label">01 / CONTENT</span>
        <div className="patent-view-stack"><i></i><i></i><i></i><i></i></div>
        <b>→</b>
        <div className="patent-display-mark"></div>
      </div>
      <div className="patent-hero-cell patent-hero-character">
        <span className="patent-diagram-label">02 / CHARACTER</span>
        <div className="patent-speech-mark">•••</div>
        <div className="patent-subject-mark"><i></i></div>
      </div>
      <div className="patent-hero-cell patent-hero-layers">
        <span className="patent-diagram-label">03 / DISPLAY</span>
        <div className="patent-layer-mark"><i></i><i></i><i></i></div>
      </div>
    </div>
  )
}

function Patents() {
  return (
    <Layout>
      <article className="case-study patents-case">
        <header className="case-hero patent-hero">
          <div className="case-hero-copy">
            <p className="kicker">Professional work · Looking Glass Factory</p>
            <h1><span>Selected</span><span>Patents</span></h1>
            <p className="case-deck">Three collaborative inventions across the light-field stack: preparing content, giving AI characters a spatial presence, and bringing high-resolution interfaces into 3D displays.</p>
          </div>
          <figure className="case-hero-image patent-hero-image">
            <PatentHeroGraphic />
            <figcaption>Content systems, embodied interaction, and display hardware.</figcaption>
          </figure>
          <dl className="case-meta">
            <div><dt>Role</dt><dd>Co-inventor</dd></div>
            <div><dt>Portfolio</dt><dd>2 issued · 1 pending</dd></div>
            <div><dt>Assignee</dt><dd>Looking Glass Factory</dd></div>
          </dl>
        </header>

        <section className="case-section case-opening patent-opening">
          <p className="case-number">01 / Through-line</p>
          <div className="case-section-copy">
            <h2>Novel hardware needs a new interaction stack.</h2>
            <p className="case-lede">A light-field display is not only a screen. Its content has to be translated into many views, calibrated to a particular optical system, and designed for people who can see—and interact with—depth.</p>
            <p>These patents address different layers of that problem. One follows an image from source material to reliable playback on a calibrated display. Another describes conversational 3D characters that can listen, remember, respond, and perform. The newest combines a multiview display with an additional transparent image layer so crisp 2D information can coexist with volumetric content.</p>
            <p>All three are collaborative inventions. The summaries below translate the published records into everyday language; they are an overview of the ideas, not a legal interpretation of the claims.</p>
          </div>
          <div className="patent-scope-row" aria-label="Three areas covered by the patents">
            <article><span>01</span><strong>Prepare</strong><p>Turn source content into display-ready light-field imagery.</p></article>
            <article><span>02</span><strong>Converse</strong><p>Give an AI character a body, memory, voice, and context.</p></article>
            <article><span>03</span><strong>Layer</strong><p>Combine detailed 2D interfaces with glasses-free 3D.</p></article>
          </div>
        </section>

        <section className="case-section patent-entry patent-entry-content">
          <p className="case-number">02 / Patent 01</p>
          <div className="case-section-copy">
            <div className="patent-status-line"><span className="patent-status">Issued 2023</span><span>US 11,736,680</span></div>
            <h2>Make a 3D image display correctly on the actual device.</h2>
            <p className="case-lede">In plain language, this patent describes a dependable path from ordinary or depth-aware source material to a glasses-free 3D image that is formatted for one specific display.</p>
            <p>The system can receive 2D, depth, or 3D content; build or render multiple perspectives; arrange those perspectives into a quilt; and align the result using the display’s calibration parameters. It also describes authenticating those calibration values before they are used, helping ensure that the software is talking to the expected hardware with the correct optical profile.</p>
            <p>The useful product idea is that creators should not have to manually manage every optical step. Content, multiview formatting, device calibration, and playback can operate as one pipeline.</p>
            <a className="patent-link" href="https://patents.google.com/patent/US11736680B2/en">Read U.S. Patent 11,736,680 <Arrow /></a>
          </div>
          <div className="patent-flow" aria-label="Source content moves through multiview rendering and calibration to a light-field display">
            <div><span>Source</span><strong>2D · depth · 3D</strong></div><i>→</i>
            <div><span>Views</span><strong>Render a quilt</strong></div><i>→</i>
            <div><span>Device</span><strong>Verify calibration</strong></div><i>→</i>
            <div><span>Output</span><strong>Light-field image</strong></div>
          </div>
          <dl className="patent-record">
            <div><dt>Official title</dt><dd>System and method for displaying a three-dimensional image</dd></div>
            <div><dt>Application</dt><dd>US 17/724,369</dd></div>
            <div><dt>Filed / issued</dt><dd>April 19, 2022 / August 22, 2023</dd></div>
            <div><dt>Named inventors</dt><dd>6</dd></div>
          </dl>
        </section>

        <section className="case-section patent-entry patent-entry-character">
          <p className="case-number">03 / Patent 02</p>
          <div className="case-section-copy">
            <div className="patent-status-line"><span className="patent-status">Pending</span><span>US 2024/0323332 A1</span></div>
            <h2>Give a generated character a body, memory, and context.</h2>
            <p className="case-lede">This application covers an embodied conversational system: a person speaks to a three-dimensional subject, an AI system determines a response, and the character delivers that response through voice, animation, appearance, or action.</p>
            <p>The published application goes beyond putting a chatbot transcript beside an avatar. It describes generating characters from prompts, grounding responses in conversation history, using sensors to react to people or the surrounding environment, and coordinating more than one model or agent to manage factuality, personality, and response time.</p>
            <p>One especially unusual technique changes where the newest user message is placed in the model’s conversation history. The goal is to reduce a “fact-spewing” tone and make the exchange feel more like dialogue—an example of interaction design reaching all the way into model orchestration.</p>
            <a className="patent-link" href="https://patents.google.com/patent/US20240323332A1/en">Read U.S. Patent Application 2024/0323332 <Arrow /></a>
          </div>
          <div className="patent-conversation" aria-label="A spoken input becomes a contextual AI response performed by a three-dimensional character">
            <div className="patent-conversation-user"><span>Viewer</span><p>Speech, gesture, or scene context</p></div>
            <div className="patent-conversation-core"><span>Conversation system</span><p>History</p><p>Language model</p><p>Personality</p></div>
            <div className="patent-conversation-subject"><span>3D subject</span><div><i></i></div><p>Voice · motion · action</p></div>
          </div>
          <dl className="patent-record">
            <div><dt>Official title</dt><dd>System and method for generating and interacting with conversational three-dimensional subjects</dd></div>
            <div><dt>Application</dt><dd>US 18/610,787</dd></div>
            <div><dt>Filed / published</dt><dd>March 20, 2024 / September 26, 2024</dd></div>
            <div><dt>Named inventors</dt><dd>7</dd></div>
          </dl>
        </section>

        <section className="case-section patent-entry patent-entry-display">
          <p className="case-number">04 / Patent 03</p>
          <div className="case-section-copy">
            <div className="patent-status-line"><span className="patent-status">Issued 2026</span><span>US 12,587,629</span></div>
            <h2>Let crisp 2D information live inside a 3D display.</h2>
            <p className="case-lede">Multiview screens trade some per-view resolution for depth. This patent adds another image-producing layer—often a transparent screen—so detailed text and interface elements can remain sharp while 3D imagery appears through or around them.</p>
            <p>The layers can overlap, occlude one another, or divide the display into 2D and 3D regions. A transparent layer can frame a hologram, add labels and controls, or visually extend the display’s depth. The system also describes interactions that move between 2D and 3D modes and processing that keeps the two images aligned.</p>
            <p>In product terms, it opens a path beyond the “hologram in a box”: ordinary high-resolution UI and spatial content can share one composition, each using the display layer best suited to it.</p>
            <a className="patent-link" href="https://patents.google.com/patent/US12587629B2/en">Read U.S. Patent 12,587,629 <Arrow /></a>
          </div>
          <div className="patent-layer-diagram" aria-label="A transparent two-dimensional display layer positioned in front of a multiview three-dimensional display">
            <span className="patent-layer-viewer">VIEWER</span>
            <div className="patent-layer-ui"><span>2D layer</span><i>Aa</i><i>＋</i></div>
            <div className="patent-layer-depth"><span>3D layer</span><i></i><i></i><i></i></div>
            <b>combined view</b>
          </div>
          <dl className="patent-record">
            <div><dt>Official title</dt><dd>Augmented superstereoscopic display</dd></div>
            <div><dt>Application</dt><dd>US 18/822,032</dd></div>
            <div><dt>Filed / issued</dt><dd>August 30, 2024 / March 24, 2026</dd></div>
            <div><dt>Named inventors</dt><dd>6</dd></div>
          </dl>
        </section>

        <section className="case-section case-takeaway patent-takeaway">
          <p className="case-number">05 / Shared perspective</p>
          <div className="case-section-copy">
            <h2>The interface extends from optics to behavior.</h2>
            <p>Across these inventions, the recurring design problem is translation: from a source image to an optical device, from language-model output to a believable character, and from flat interface conventions to a display with physical depth. The patent work reflects a product practice where hardware, software, and interaction design have to be considered together.</p>
            <div className="case-principles patent-principles">
              <p><span>01</span>Hide optical complexity without hiding how the medium works.</p>
              <p><span>02</span>Treat latency, memory, voice, and animation as one conversation.</p>
              <p><span>03</span>Use 2D and 3D for the information each represents best.</p>
            </div>
            <p className="case-links">These selected records cover the active and pending U.S. patent families that name Alexander Duncan as an inventor and Looking Glass Factory as assignee. The abandoned application is intentionally omitted.</p>
          </div>
        </section>
      </article>
    </Layout>
  )
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

  if (path.endsWith('/about.html')) return <About />
  if (path.endsWith('/looking-glass-unity.html')) return <LookingGlassUnity />
  if (path.endsWith('/parsem.html')) return <Parsem />
  if (path.endsWith('/surely-ai-can.html')) return <SurelyAiCan />
  if (path.endsWith('/ect.html')) return <EveryCreepingThing />
  if (path.endsWith('/liteforms.html')) return <Liteforms />
  if (path.endsWith('/patents.html')) return <Patents />
  if (path.endsWith('/beyond-fair-use') || path.endsWith('/beyond-fair-use/') || path.endsWith('/beyond-fair-use/index.html')) return <BeyondFairUse />
  if (path.endsWith('/beyond-fair-use.html')) return <BeyondFairUse />
  if (path.endsWith('/games-biting-back.html')) return <GamesBitingBack />
  const essay = essays[path]
  if (essay) return <Essay essay={essay} />
  return <Home />
}
