import { Component, OnDestroy } from "@angular/core";
import { Subject } from "rxjs";

@Component({
  template: ''
})
export class BaseComponent implements OnDestroy {
  protected readonly destroy$: Subject<void> = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.unsubscribe();
  }
}
