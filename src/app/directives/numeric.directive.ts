import {Directive, ElementRef, HostListener, Input} from "@angular/core";

@Directive({
    selector: "[numeric]"
})
export class NumericDirective {
    @Input("decimals") decimals: number = 0;
    @Input("negative") negative: number = 0;

    constructor(private el: ElementRef) {
    }

    // noinspection JSUnusedLocalSymbols
    @HostListener("keydown", ["$event"])
    onKeyDown(event: KeyboardEvent) {
        this.run(this.el.nativeElement.value);
    }

    // noinspection JSUnusedLocalSymbols
    @HostListener("paste", ["$event"])
    onPaste(event: ClipboardEvent) {
        this.run(this.el.nativeElement.value);
    }

    private checkAllowNegative(value: string) {
        if (this.decimals <= 0) {
            return String(value).match(new RegExp(/^-?\d+$/));
        } else {
            const regExpString =
                "^-?\\s*((\\d+(\\.\\d{0," +
                this.decimals +
                "})?)|((\\d*(\\.\\d{1," +
                this.decimals +
                "}))))\\s*$";
            return String(value).match(new RegExp(regExpString));
        }
    }

    private check(value: string) {
        if (this.decimals <= 0) {
            return String(value).match(new RegExp(/^\d+$/));
        } else {
            const regExpString =
                "^\\s*((\\d+(\\.\\d{0," +
                this.decimals +
                "})?)|((\\d*(\\.\\d{1," +
                this.decimals +
                "}))))\\s*$";
            return String(value).match(new RegExp(regExpString));
        }
    }

    private run(oldValue) {
        setTimeout(() => {
            let currentValue: string = this.el.nativeElement.value;
            let allowNegative = this.negative > 0;

            if (allowNegative) {
                if (
                    !["", "-"].includes(currentValue) &&
                    !this.checkAllowNegative(currentValue)
                ) {
                    this.el.nativeElement.value = oldValue;
                }
            } else {
                if (currentValue !== "" && !this.check(currentValue)) {
                    this.el.nativeElement.value = oldValue;
                }
            }
        });
    }
}
