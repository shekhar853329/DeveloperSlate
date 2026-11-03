import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ast-tree-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="font-mono text-xs p-4 bg-slate-900 text-slate-200 select-none overflow-x-auto space-y-1">
      <div
        (click)="selectNode('TypeAliasDeclaration: Flatten')"
        class="cursor-pointer p-1.5 rounded hover:bg-slate-800 flex items-center gap-2"
        [class.bg-cyan-500-20]="selectedNode === 'TypeAliasDeclaration: Flatten'"
        [class.text-cyan-400]="selectedNode === 'TypeAliasDeclaration: Flatten'"
      >
        <span class="material-symbols-outlined text-cyan-400 text-[16px]">account_tree</span>
        <span class="font-bold">TypeAliasDeclaration</span>
        <span class="text-amber-400 font-semibold">Flatten&lt;T&gt;</span>
      </div>

      <div class="pl-6 border-l border-slate-700/60 ml-3 space-y-1">
        <div
          (click)="selectNode('TypeParameter: T')"
          class="cursor-pointer p-1.5 rounded hover:bg-slate-800 flex items-center gap-2"
          [class.bg-cyan-500-20]="selectedNode === 'TypeParameter: T'"
        >
          <span class="text-slate-500">├──</span>
          <span class="text-purple-400">TypeParameter:</span>
          <span>T</span>
        </div>

        <div
          (click)="selectNode('ConditionalType')"
          class="cursor-pointer p-1.5 rounded hover:bg-slate-800 flex items-center gap-2"
          [class.bg-cyan-500-20]="selectedNode === 'ConditionalType'"
          [class.text-cyan-400]="selectedNode === 'ConditionalType'"
        >
          <span class="text-slate-500">└──</span>
          <span class="font-bold text-emerald-400">ConditionalType</span>
          <span class="text-slate-400 text-[10px]">(T extends Array&lt;infer Item&gt; ? Item : T)</span>
        </div>

        <div class="pl-6 border-l border-slate-700/60 ml-3 space-y-1">
          <div
            (click)="selectNode('CheckType: TypeReference (T)')"
            class="cursor-pointer p-1 rounded hover:bg-slate-800 flex items-center gap-2"
            [class.bg-cyan-500-20]="selectedNode === 'CheckType: TypeReference (T)'"
          >
            <span class="text-slate-500">├── checkType:</span>
            <span class="text-cyan-300">TypeReference (T)</span>
          </div>

          <div
            (click)="selectNode('ExtendsType: TypeReference (Array<infer Item>)')"
            class="cursor-pointer p-1 rounded hover:bg-slate-800 flex items-center gap-2"
            [class.bg-cyan-500-20]="selectedNode === 'ExtendsType: TypeReference (Array<infer Item>)'"
          >
            <span class="text-slate-500">├── extendsType:</span>
            <span class="text-cyan-300">TypeReference (Array&lt;infer Item&gt;)</span>
          </div>

          <div class="pl-6 border-l border-slate-700/60 ml-3 space-y-1">
            <div
              (click)="selectNode('InferType: Item')"
              class="cursor-pointer p-1 rounded hover:bg-slate-800 flex items-center gap-2 text-amber-300"
              [class.bg-cyan-500-20]="selectedNode === 'InferType: Item'"
            >
              <span class="text-slate-500">└── inferType:</span>
              <span class="font-bold">infer Item</span>
            </div>
          </div>

          <div
            (click)="selectNode('TrueType: TypeReference (Item)')"
            class="cursor-pointer p-1 rounded hover:bg-slate-800 flex items-center gap-2"
            [class.bg-cyan-500-20]="selectedNode === 'TrueType: TypeReference (Item)'"
          >
            <span class="text-slate-500">├── trueType:</span>
            <span class="text-emerald-300">TypeReference (Item)</span>
          </div>

          <div
            (click)="selectNode('FalseType: TypeReference (T)')"
            class="cursor-pointer p-1 rounded hover:bg-slate-800 flex items-center gap-2"
            [class.bg-cyan-500-20]="selectedNode === 'FalseType: TypeReference (T)'"
          >
            <span class="text-slate-500">└── falseType:</span>
            <span class="text-rose-300">TypeReference (T)</span>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AstTreeViewComponent {
  @Input() selectedNode = 'TypeAliasDeclaration: Flatten';
  @Output() onSelect = new EventEmitter<string>();

  selectNode(name: string): void {
    this.selectedNode = name;
    this.onSelect.emit(name);
  }
}

@Component({
  selector: 'app-ast-node-inspector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 border-t border-slate-200 dark:border-[#1e293b] bg-slate-50 dark:bg-[#111827] text-xs font-mono">
      <div class="flex items-center justify-between mb-2">
        <span class="text-slate-400 font-bold uppercase text-[10px]">Active Node Telemetry</span>
        <span class="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-bold">SYNTAX VALID</span>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px]">
        <div>
          <span class="text-slate-500 block">Identifier:</span>
          <span class="text-cyan-400 font-semibold">{{ nodeName }}</span>
        </div>
        <div>
          <span class="text-slate-500 block">AST Syntax Kind:</span>
          <span class="text-slate-800 dark:text-slate-200">262 (TypeAlias)</span>
        </div>
        <div>
          <span class="text-slate-500 block">Byte Span:</span>
          <span class="text-slate-800 dark:text-slate-200">[0..57]</span>
        </div>
        <div>
          <span class="text-slate-500 block">Compiler Target:</span>
          <span class="text-emerald-400">TypeScript 5.4+</span>
        </div>
      </div>
    </div>
  `
})
export class AstNodeInspectorComponent {
  @Input() nodeName = 'TypeAliasDeclaration: Flatten';
}

