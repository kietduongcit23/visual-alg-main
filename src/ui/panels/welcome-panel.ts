export interface WelcomePanelRefs {
  root: HTMLElement;
  dismissButton: HTMLButtonElement;
}

export function createWelcomePanel(): WelcomePanelRefs {
  const root = document.createElement('section');
  root.className = 'welcome-panel';
  root.innerHTML = `
    <div class="welcome-copy">
      <p class="eyebrow">Welcome Lesson</p>
      <h2>Learn arrays one visible step at a time</h2>
      <p>Pick a lesson, press Next or Run, and watch how pointers, reads, writes, and variables evolve together.</p>
    </div>
  `;

  const dismissButton = document.createElement('button');
  dismissButton.type = 'button';
  dismissButton.className = 'welcome-dismiss';
  dismissButton.textContent = 'Start exploring';

  root.append(dismissButton);
  return { root, dismissButton };
}