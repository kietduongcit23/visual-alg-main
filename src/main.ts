import './editor/monaco-worker';
import { bootstrap } from './app/bootstrap';
import './styles/reset.css';
import './styles/app.css';

bootstrap(document.querySelector<HTMLDivElement>('#app'));