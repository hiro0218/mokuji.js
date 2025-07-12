/**
 * Core definitions for type safety
 * Central module that imports and exports type definitions from all categories
 */

// Type definitions for functional programming
import type { Result, Option, NonEmptyArray, Transform, ErrorHandler, Predicate, Effect } from './functional';

// Type definitions for headings
import type { HeadingLevel, HeadingInfo, HeadingExtractOptions } from './heading';

// Type definitions for table of contents
import type {
  ContainerTagName,
  AnchorPosition,
  TocItem,
  TocStructure,
  MokujiConfig,
  RequiredMokujiConfig,
  MokujiResult,
} from './toc';

// Type definitions for DOM operations
import type { DomEffect, ElementFactory } from './dom';

// Re-export all types
export type {
  // Functional types
  Result,
  Option,
  NonEmptyArray,
  Transform,
  ErrorHandler,
  Predicate,
  Effect,

  // Heading types
  HeadingLevel,
  HeadingInfo,
  HeadingExtractOptions,

  // TOC types
  ContainerTagName,
  AnchorPosition,
  TocItem,
  TocStructure,
  MokujiConfig,
  RequiredMokujiConfig,
  MokujiResult,

  // DOM types
  DomEffect,
  ElementFactory,
};
