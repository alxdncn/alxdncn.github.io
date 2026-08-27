import { useEffect } from 'react'
import { BonsaiScene } from './components/BonsaiScene'
import beyondFairUseText from './beyondFairUse.md?raw'
import gamesBitingBackText from './gamesBitingBack.md?raw'

const projects = [
  { title: 'Surely, AI Can', image: '/images/large/surelyaican.jpg', href: 'https://surelyaican.com/', text: 'A parody AI benchmarking site that shows the surprising ways frontier models fail.' },
  { title: 'Parsem: AI Search Redesigned', image: '/images/large/parsem.png', href: 'https://parsemsearch.app/', text: 'AI search rebuilt for transparency: every part of each answer links to a real, visible source, giving credit back to the people who wrote it.' },
  { title: 'Every Creeping Thing', image: '/images/thumbs/ect.png', href: '/ect.html', text: 'A 3D game where the player sees the world from the perspective of different animals. Sound design by Seth S. Scott.' },
  { title: 'Standard Assets', image: '/images/large/standardassets.gif', href: 'https://alxdncn.itch.io/standard-assets', text: 'An experimental 3D game examining the environment package of Unity Standard Assets.' },
  { title: 'On Nature', image: '/images/thumbs/OnNatureGif.gif', href: 'https://alxdncn.itch.io/on-nature', text: 'A web game depicting an environment in different representational modes.' },
  { title: 'Space Kitty', image: '/images/thumbs/spacekitty.png', href: 'https://tafkaf.itch.io/space-kitty', text: 'A digital and physical game where players use their phone flashlights to protect a space kitty from dogliens. Collaboration with Karina Popp.' },
  { title: 'Small Song', image: '/images/thumbs/smallsong.png', href: 'https://alxdncn.itch.io/small-song', text: "A short interactive interpretation of A.R. Ammons's twelve-word poem, using the player's location and time to determine the sun and lighting." },
  { title: 'Flora', image: '/images/thumbs/flora.png', href: 'https://gamejolt.com/games/flora/54787', text: 'Help a small tree survive the seasons and grow to be a giant of the forest.' },
]

const professional = [
  { title: 'Looking Glass Unity Plugin', image: '/images/looking-glass-unity/unity-workflow-with-character.jpg', href: '/looking-glass-unity.html', text: 'A creator tool that translated light-field rendering into familiar Unity concepts: a volumetric camera, quilt capture, depth-aware focus, and 3D interaction.' },
  { title: 'Liteforms', image: '/images/large/liteforms-large.gif', href: 'https://lookingglassfactory.com/liteforms', text: "A desktop application for talking to and creating holographic characters. A design exploration of embodied AI for Looking Glass displays, where I’m the product lead." },
  { title: 'Holographic Elemental', image: '/images/large/elemental-pixar.gif', href: 'https://blog.lookingglassfactory.com/thattimewewenttopixar/', text: 'For Pixar’s Elemental, I supported the team with visual design for bringing Ember and Wade to a Looking Glass display.' },
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

function ProjectGrid({ items }) {
  return <div className="project-grid">{items.map((p, i) => <article className="project" key={p.title} style={{ '--delay': `${i * 45}ms` }}><a className="project-image" href={p.href}><img src={p.image} alt={`${p.title} project preview`} loading="lazy" decoding="async" /><span className="project-index">{String(i + 1).padStart(2, '0')}</span></a><div className="project-copy"><h3><a href={p.href}>{p.title} <Arrow /></a></h3><p>{p.text}</p></div></article>)}</div>
}

function SectionHead({ kicker, title, action }) {
  return <div className="section-head"><div><p className="kicker">{kicker}</p><h2>{title}</h2></div>{action && <a className="text-link" href={action.href}>{action.label} →</a>}</div>
}

function Layout({ children }) {
  return <><Header /><main>{children}</main><footer><p>Alex Duncan</p><p>Brooklyn, New York · <a href="mailto:alxdncn@gmail.com">alxdncn@gmail.com</a></p><p>Games, Technology, & Interactive Art</p></footer></>
}

function HeroBonsai() {

  return (
    <div className="bonsai-hero" aria-hidden="true">
      <BonsaiScene seed={7319} branching={360} rootBranching={0} initialGrowthSteps={20} speed={0.6} paused={false} onStats={() => {}} />
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
              <img src="/images/looking-glass-unity/depth-of-field.gif" alt="Looking Glass display showing depth-of-field blur across several cubes" loading="lazy" />
              <figcaption>Depth of field makes off-plane crosstalk feel like intentional focus.</figcaption>
            </figure>
            <figure className="case-media">
              <img src="/images/looking-glass-unity/dynamic-lighting.gif" alt="A reflective watch rotating as highlights move across its material" loading="lazy" />
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
            <img src="/images/looking-glass-unity/desk-turbine.gif" alt="A mechanical assembly displayed as a hologram on a desk while a person controls it" loading="lazy" />
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
            <img src="/images/looking-glass-unity/jet-engine.gif" alt="A jet engine model in a Looking Glass display being explored with hand tracking" loading="lazy" />
            <figcaption>Tools and interaction patterns converged around a simple goal: make spatial content understandable by looking and acting.</figcaption>
          </figure>
          <p className="case-links">See the official <a href="https://lfdocs.lookingglassfactory.com/software/index">Unity Plugin documentation</a>, <a href="https://lfdocs.lookingglassfactory.com/software/index/prefabs/hologram-camera">Hologram Camera guide</a>, <a href="https://lfdocs.lookingglassfactory.com/keyconcepts/quilts">quilt format overview</a>, <a href="https://lfdocs.lookingglassfactory.com/software/index/prefabs/3d-cursor">3D Cursor guide</a>, and <a href="https://github.com/regcs/AliceLG">Alice/LG Blender add-on</a>.</p>
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
