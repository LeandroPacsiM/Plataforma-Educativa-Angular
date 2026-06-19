import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  styles: [`
    footer { border-top: 1px solid var(--border); background: var(--bg-alt); padding: 3rem 1.5rem; text-align: center; }
    .inner { max-width: 72rem; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
    @media (min-width: 768px) { .inner { flex-direction: row; justify-content: space-between; } }
    .brand { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.125rem; color: var(--primary); }
    .brand svg { width: 1.5rem; height: 1.5rem; }
    .copy { font-size: 0.8125rem; color: var(--fg-subtle); }
    .links { display: flex; gap: 1.5rem; }
    .links a { font-size: 0.8125rem; color: var(--fg-subtle); transition: color 0.2s; cursor: pointer; background: none; border: none; }
    .links a:hover { color: var(--primary); }
  `],
  template: `
    <footer>
      <div class="inner">
        <div class="brand">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          EduPlat
        </div>
        <div class="copy">&copy; {{ year }} EduPlat. Todos los derechos reservados.</div>
        <div class="links">
          <a>T&eacute;rminos legales</a>
          <a>Privacidad</a>
          <a>Contacto</a>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  year = new Date().getFullYear();
}
