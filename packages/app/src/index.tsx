/* eslint-disable no-console */
/** @jsx createElement */
import { createElement, render } from 'my-react';
import { TodoMVC } from './TodoMVC';
import { TodoModel } from './model';
import './index.css';

render(
  <TodoMVC model={new TodoModel('myReact-TodoMVC')} />,
  document.getElementById('container') as HTMLDivElement
);
