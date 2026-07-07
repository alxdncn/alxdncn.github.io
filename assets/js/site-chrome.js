class SiteHeader extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
			<header id="header">
				<h1>I'm Alex. I make and write about new technology and games. I also make holograms at <a href="https://lookingglassfactory.com">Looking Glass</a>.</h1>
			</header>`;
	}
}

class SiteNav extends HTMLElement {
	connectedCallback() {
		this.innerHTML = `
			<section aria-label="Site navigation">
				<ul class="actions">
					<li><a href="index.html" class="button">Main Page</a></li>
					<li><a href="about.html" class="button">About Me</a></li>
					<li><a href="portfolio.html" class="button">Portfolio</a></li>
				</ul>
			</section>`;
	}
}

customElements.define('site-header', SiteHeader);
customElements.define('site-nav', SiteNav);
