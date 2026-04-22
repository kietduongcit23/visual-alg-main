import type { LessonDefinition } from './lesson-types';

export const javaBasicsLesson: LessonDefinition = {
  id: 'java-basics',
  title: 'Java Hello World',
  description: 'A simple Java program to test the new Monaco editor.',
  category: 'basics',
  starterCode: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, world!");
        System.out.println("Welcome to the Java Visualizer.");
    }
}`,
  initialBindings: {},
  watchedVariables: [],
  pointerVariables: [],
  primaryStructure: 'array',
  explanationMap: {
    FINISH: 'Java execution complete.',
  },
};
