import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AstComparisonItem } from '../../../core/models/models';
import { AstTreeViewComponent, AstNodeInspectorComponent } from '../components/ast-components';

@Component({
  selector: 'app-ast-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AstTreeViewComponent, AstNodeInspectorComponent],
  template: `
    <div class="max-w-6xl mx-auto">
      <!-- Title -->
      <div class="mb-6 pb-4 border-b border-slate-200 dark:border-[#1e293b]">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <span class="material-symbols-outlined text-cyan-500">account_tree</span>
          <span>AST Visualizer - Syntax Tree Comparison</span>
        </h1>
        <p class="text-xs font-mono text-slate-500 mt-1">
          Explore Abstract Syntax Tree representations, compiler tokenizations, and recursive type expansions.
        </p>
      </div>

      <!-- Editor & Tree Grid -->
      <div class="rounded-lg border border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#111827] overflow-hidden shadow-sm mb-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-[#1e293b]">
          <!-- Left: Code Input -->
          <div class="flex flex-col">
            <div class="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#161b22] text-xs font-mono">
              <span class="font-bold text-slate-700 dark:text-slate-300">INPUT SOURCE (TypeScript)</span>
              <span class="text-cyan-400">ESNext</span>
            </div>
            <textarea
              [(ngModel)]="sourceCode"
              rows="12"
              class="w-full p-4 bg-slate-900 text-cyan-300 font-mono text-xs leading-relaxed focus:outline-none resize-none flex-1"
            ></textarea>
          </div>

          <!-- Right: Visual AST Tree View -->
          <div class="flex flex-col">
            <div class="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#161b22] text-xs font-mono">
              <span class="font-bold text-slate-700 dark:text-slate-300">ABSTRACT SYNTAX TREE</span>
              <span class="text-emerald-400">Recursive Nodes (6)</span>
            </div>
            <app-ast-tree-view
              [selectedNode]="activeNode"
              (onSelect)="activeNode = $event"
            ></app-ast-tree-view>
          </div>
        </div>

        <!-- Node Inspector Telemetry -->
        <app-ast-node-inspector [nodeName]="activeNode"></app-ast-node-inspector>
      </div>
    </div>
  `
})
export class AstPageComponent implements OnInit {
  private apiService = inject(ApiService);

  sourceCode = `type Flatten<T> = T extends Array<infer Item> ? Item : T;`;
  activeNode = 'TypeAliasDeclaration: Flatten';

  ngOnInit(): void {
    this.apiService.getAstComparisons().subscribe(list => {
      if (list.length > 0) {
        this.sourceCode = list[0].sourceCode;
      }
    });
  }
}

