import {Injectable} from "@angular/core";
import {Scale, SCALES} from "../model/intern/scale";
import {round} from "lodash";

export interface Glyph {
    character: string,
    width: number,
    height: number,
    svgPath: string,
}

export const GLYPHS = new Map<string, Glyph>([
    [
        "0",
        {
            character: "0",
            width: 18.618,
            height: 30,
            svgPath: `m18.618 14.99q0 3.5282-0.51827 6.3189-0.49834 2.7907-1.6346 4.7242-1.1163 1.9336-2.8904 2.9502-1.7741 1.0166-4.3056 1.0166-2.3522 0-4.1063-1.0166-1.7342-1.0166-2.8904-2.9502-1.1362-1.9336-1.7143-4.7242-0.55814-2.7907-0.55814-6.3189 0-3.5282 0.49834-6.3189 0.51827-2.7907 1.6146-4.7043 1.1163-1.9336 2.8704-2.9502 1.7741-1.0166 4.2857-1.0166 2.3721 0 4.1262 1.0166 1.7542 0.99668 2.9103 2.9302 1.1561 1.9136 1.7342 4.7043 0.57807 2.7907 0.57807 6.3389zm-14.93 0q0 2.99 0.299 5.2226 0.299 2.2326 0.95681 3.7276 0.65781 1.4751 1.7143 2.2326 1.0764 0.73754 2.6113 0.73754t2.6113-0.73754q1.0764-0.73754 1.7542-2.2126 0.69767-1.4751 0.99668-3.7076 0.31894-2.2525 0.31894-5.2625 0-2.99-0.31894-5.2226-0.299-2.2326-0.99668-3.7076-0.67774-1.4751-1.7542-2.2126-1.0764-0.73754-2.6113-0.73754t-2.6113 0.73754q-1.0565 0.73754-1.7143 2.2126-0.65781 1.4751-0.95681 3.7076-0.299 2.2326-0.299 5.2226z`
        }
    ],
    [
        "1",
        {
            character: "1",
            width: 10.625,
            height: 30,
            svgPath: `m10.625 29.601h-3.5083v-18.199q0-0.85714 0-1.8339 0.019934-0.97674 0.039867-1.9336 0.039867-0.97674 0.059801-1.8538 0.039867-0.89701 0.059801-1.5748-0.33887 0.3588-0.59801 0.61794-0.25914 0.25914-0.53821 0.49834-0.25914 0.2392-0.55814 0.51827-0.299 0.25914-0.71761 0.61794l-2.9502 2.412-1.9136-2.4518 7.6345-5.9601h2.99z`
        }
    ],
    [
        "2",
        {
            character: "2",
            width: 18.179,
            height: 30,
            svgPath: `m18.179 29.781h-18.179v-3.1096l6.9767-7.5947q1.495-1.6146 2.6711-2.9502 1.1761-1.3355 1.9934-2.6113 0.83721-1.2757 1.2757-2.5515 0.43854-1.2957 0.43854-2.8106 0-1.1761-0.33887-2.0731-0.33887-0.89701-0.97674-1.5149-0.61794-0.63787-1.4751-0.95681-0.85714-0.31894-1.9136-0.31894-1.8937 0-3.4286 0.77741-1.5149 0.75747-2.8904 1.9535l-2.0332-2.3721q0.79734-0.71761 1.7143-1.3355 0.91694-0.63787 1.9734-1.0963 1.0565-0.45847 2.2326-0.71761 1.1761-0.27907 2.4718-0.27907 1.9136 0 3.4485 0.53821 1.5548 0.53821 2.6312 1.5548 1.0764 0.99668 1.6545 2.4518 0.59801 1.4352 0.59801 3.2492 0 1.6944-0.53821 3.2292-0.51827 1.5349-1.4551 3.0299-0.91694 1.4751-2.2126 2.9701-1.2757 1.495-2.7708 3.1096l-5.6013 5.9601v0.15947h13.734z`
        }
    ],
    [
        "3",
        {
            character: "3",
            width: 18.419,
            height: 30,
            svgPath: `m17.522 7.2558q0 1.4551-0.45847 2.6512-0.45847 1.196-1.2957 2.0731-0.81728 0.87708-1.9734 1.4551-1.1561 0.55814-2.5714 0.79734v0.1196q3.5282 0.43854 5.3621 2.2525 1.8339 1.794 1.8339 4.6844 0 1.9136-0.65781 3.5083-0.63787 1.5947-1.9535 2.7508-1.3156 1.1561-3.3289 1.794t-4.7641 0.63787q-2.1728 0-4.1063-0.33887-1.9136-0.33887-3.608-1.2359v-3.3887q1.7342 0.91694 3.7475 1.4153 2.0332 0.49834 3.887 0.49834 1.8339 0 3.1694-0.39867 1.3355-0.39867 2.1927-1.1362 0.87708-0.73754 1.2757-1.814 0.4186-1.0764 0.4186-2.412 0-1.3555-0.53821-2.3123-0.51827-0.97674-1.495-1.5947-0.97674-0.63787-2.392-0.93688-1.3953-0.299-3.1694-0.299h-2.6512v-3.01h2.6512q1.6146 0 2.8704-0.39867 1.2558-0.39867 2.093-1.1362 0.85714-0.73754 1.2957-1.7542 0.43854-1.0166 0.43854-2.2326 0-1.0365-0.3588-1.8538t-1.0166-1.3754q-0.65781-0.57807-1.5748-0.87708-0.91694-0.299-2.0332-0.299-2.1329 0-3.7674 0.67774-1.6146 0.65781-3.0897 1.7342l-1.8339-2.4917q0.75747-0.61794 1.6744-1.1561 0.93688-0.53821 2.0332-0.93688 1.0963-0.4186 2.3322-0.65781 1.2558-0.2392 2.6512-0.2392 2.1528 0 3.7674 0.53821 1.6346 0.53821 2.7309 1.5149 1.0963 0.95681 1.6545 2.2924 0.55814 1.3156 0.55814 2.8904z`
        }
    ],
    [
        "4",
        {
            character: "4",
            width: 21.209,
            height: 30,
            svgPath: `m21.209 23.113h-4.2458v6.5382h-3.5083v-6.5382h-13.455v-3.1694l13.216-19.595h3.7475v19.455h4.2458zm-7.7541-3.309v-7.0963q0-1.1163 0.01993-2.3322 0.03987-1.2359 0.07973-2.392 0.03987-1.1761 0.07973-2.1927 0.0598-1.0166 0.07973-1.6944h-0.1794q-0.13953 0.39867-0.3588 0.89701-0.19934 0.47841-0.45847 0.97674-0.2392 0.4784-0.49834 0.93688-0.25914 0.45847-0.47841 0.77741l-8.1927 12.12z`
        }
    ],
    [
        "5",
        {
            character: "5",
            width: 17.601,
            height: 30,
            svgPath: `m8.2525 11.492q1.9734 0 3.6678 0.55814 1.7143 0.5382 2.9701 1.6146 1.2757 1.0764 1.9934 2.6711 0.71761 1.5947 0.71761 3.6877 0 2.2724-0.67774 4.0864-0.67774 1.814-2.0133 3.0698-1.3355 1.2558-3.309 1.9336-1.9535 0.65781-4.505 0.65781-1.0166 0-2.0133-0.09967-0.97674-0.099665-1.8937-0.299-0.89701-0.1794-1.7143-0.4784-0.81728-0.299-1.4751-0.69768v-3.4286q0.65781 0.45847 1.5349 0.81728 0.89701 0.3588 1.8738 0.59801 0.97674 0.2392 1.9535 0.37874 0.99668 0.1196 1.8339 0.1196 1.5748 0 2.8106-0.3588 1.2359-0.37874 2.093-1.1561 0.85714-0.77741 1.3156-1.9535 0.45847-1.1761 0.45847-2.7907 0-2.8505-1.7542-4.3455-1.7542-1.515-5.103-1.515-0.53821 0-1.1761 0.0598-0.61794 0.03987-1.2558 0.1196-0.61794 0.07973-1.196 0.1794-0.55814 0.079735-0.97674 0.15947l-1.794-1.1362 1.0963-13.714h13.754v3.309h-10.605l-0.77741 8.3522q0.63787-0.1196 1.6744-0.25914 1.0565-0.13953 2.4917-0.13953z`
        }
    ],
    [
        "6",
        {
            character: "6",
            width: 18.359,
            height: 30,
            svgPath: `m-3.7253e-8 17.123q0-2.093 0.19934-4.1661 0.21927-2.0731 0.73754-3.9668 0.53821-1.9136 1.4551-3.5482 0.91694-1.6346 2.3322-2.8306 1.4153-1.2159 3.3887-1.8937 1.9734-0.69767 4.6246-0.69767 0.37874 0 0.83721 0.019934 0.45847 0.019934 0.91694 0.079734 0.4784 0.039867 0.89701 0.1196 0.43854 0.059801 0.77741 0.15947v3.0897q-0.69767-0.2392-1.5748-0.3588-0.87708-0.1196-1.7342-0.1196-1.794 0-3.1694 0.43854-1.3555 0.4186-2.3522 1.196t-1.6744 1.8538q-0.65781 1.0764-1.0764 2.392-0.4186 1.2957-0.61794 2.7708-0.19934 1.4751-0.25914 3.0698h0.2392q0.39867-0.71761 0.95681-1.3355 0.57807-0.63787 1.3355-1.0764 0.75747-0.45847 1.6944-0.71761 0.95681-0.25914 2.1329-0.25914 1.8937 0 3.4286 0.59801 1.5349 0.57807 2.6113 1.7143 1.0764 1.1362 1.6545 2.7907 0.59801 1.6346 0.59801 3.7475 0 2.2724-0.61794 4.0864-0.61794 1.814-1.7741 3.0897-1.1561 1.2558-2.7907 1.9336-1.6346 0.67774-3.6678 0.67774-1.9934 0-3.7475-0.77741-1.7342-0.77741-3.01-2.3721-1.2757-1.5947-2.0133-4.0066-0.73754-2.412-0.73754-5.701zm9.4684 9.8073q1.196 0 2.1728-0.39867 0.99668-0.4186 1.7143-1.2359 0.71761-0.83721 1.0963-2.093 0.39867-1.2757 0.39867-3.01 0-1.3953-0.33887-2.4917-0.31894-1.1163-0.97674-1.8937-0.65781-0.77741-1.6545-1.196-0.97674-0.4186-2.2924-0.4186-1.3355 0-2.4518 0.4784-1.0963 0.45847-1.8738 1.2159-0.77741 0.73754-1.2159 1.6944-0.4186 0.95681-0.4186 1.9136 0 1.3355 0.3588 2.6711 0.37874 1.3156 1.0963 2.3721 0.73754 1.0565 1.8339 1.7342 1.0963 0.65781 2.5515 0.65781z`
        }
    ],
    [
        "7",
        {
            character: "7",
            width: 18.738,
            height: 30,
            svgPath: `m3.8073 29.571 11.223-25.834h-15.03v-3.309h18.738v2.8904l-11.063 26.252z`
        }
    ],
    [
        "8",
        {
            character: "8",
            width: 18.299,
            height: 30,
            svgPath: `m9.1495 7.2792e-6q1.6744 0 3.1495 0.43854 1.495 0.43854 2.6113 1.3156 1.1362 0.87708 1.794 2.1927t0.65781 3.0698q0 1.3355-0.39867 2.412-0.39867 1.0764-1.0963 1.9535-0.69767 0.85714-1.6545 1.5548-0.95681 0.67774-2.0731 1.2359 1.1561 0.61794 2.2525 1.3754 1.1163 0.75747 1.9734 1.7143 0.87708 0.93688 1.3953 2.113 0.53821 1.1761 0.53821 2.6312 0 1.8339-0.67774 3.3289-0.65781 1.4751-1.8738 2.5116-1.196 1.0365-2.8904 1.5947-1.6744 0.55814-3.7076 0.55814-2.1927 0-3.907-0.53821-1.6944-0.5382-2.8704-1.5349-1.1561-1.0166-1.7741-2.4718-0.59801-1.4551-0.59801-3.289 0-1.495 0.43854-2.691 0.45847-1.196 1.2159-2.1528 0.75747-0.95681 1.794-1.6944t2.1927-1.2957q-0.97674-0.61794-1.8339-1.3355-0.85714-0.73754-1.495-1.6346-0.61794-0.89701-0.99668-1.9734-0.3588-1.0963-0.3588-2.412 0-1.7342 0.65781-3.0299 0.67774-1.3156 1.814-2.1927 1.1362-0.87708 2.6113-1.3156 1.495-0.43854 3.1096-0.43854zm-5.5814 22.206q0 1.0565 0.31894 1.9535 0.31894 0.87708 0.99668 1.5149 0.67774 0.61794 1.7143 0.97674 1.0365 0.33887 2.4718 0.33887 1.3953 0 2.4518-0.33887 1.0764-0.3588 1.794-0.99668 0.71761-0.65781 1.0764-1.5748t0.3588-2.0332q0-1.0365-0.39867-1.8738-0.37874-0.83721-1.1163-1.5548-0.71761-0.71761-1.7342-1.3555-1.0166-0.63787-2.2724-1.2558l-0.59801-0.27907q-2.5116 1.196-3.7874 2.7508-1.2757 1.5349-1.2757 3.7276zm5.5415-19.176q-2.113 0-3.3688 1.0565-1.2359 1.0565-1.2359 3.0698 0 1.1362 0.33887 1.9535 0.3588 0.81728 0.97674 1.4551 0.61794 0.63787 1.4751 1.1561 0.87708 0.49834 1.8937 0.97674 0.95681-0.43854 1.794-0.95681 0.85714-0.51827 1.4751-1.1761 0.63787-0.65781 0.99668-1.495 0.3588-0.83721 0.3588-1.9136 0-2.0133-1.2558-3.0698-1.2558-1.0565-3.4485-1.0565z`
        }
    ],
    [
        "9",
        {
            character: "9",
            width: 18.379,
            height: 30,
            svgPath: `m18.379 12.877q0 2.093-0.21927 4.186-0.19934 2.0731-0.73754 3.9668-0.51827 1.8937-1.4352 3.5482-0.91694 1.6346-2.3322 2.8306-1.4153 1.196-3.3887 1.8937-1.9734 0.67774-4.6246 0.67774-0.37874 0-0.83721-0.01993t-0.91694-0.07973q-0.45847-0.03987-0.89701-0.09967t-0.77741-0.15947v-3.1096q0.69767 0.25914 1.5748 0.37874 0.87708 0.1196 1.7342 0.1196 2.691 0 4.4252-0.93688 1.7342-0.93688 2.7508-2.5316 1.0166-1.6146 1.4352-3.7475 0.43854-2.1329 0.53821-4.505h-0.25914q-0.39867 0.71761-0.95681 1.3355-0.55814 0.61794-1.3156 1.0764-0.75747 0.45847-1.7143 0.71761-0.95681 0.25914-2.1329 0.25914-1.8937 0-3.4286-0.57807-1.5349-0.59801-2.6113-1.7342t-1.6744-2.7708q-0.57807-1.6545-0.57807-3.7674 0-2.2724 0.61794-4.0864 0.63787-1.8339 1.7741-3.0897 1.1561-1.2757 2.7907-1.9535 1.6545-0.67774 3.6877-0.67774 2.0133 0 3.7475 0.77741 1.7342 0.77741 3.01 2.3721 1.2757 1.5947 2.0133 4.0266 0.73754 2.412 0.73754 5.6811zm-9.4684-9.7874q-1.196 0-2.1927 0.39867-0.97674 0.39867-1.6944 1.2359-0.71761 0.83721-1.1163 2.113-0.37874 1.2558-0.37874 2.99 0 1.3953 0.31894 2.5116 0.33887 1.0963 0.99668 1.8738 0.65781 0.77741 1.6346 1.196 0.99668 0.4186 2.3123 0.4186 1.3555 0 2.4518-0.45847 1.0963-0.4784 1.8738-1.2159 0.77741-0.75747 1.196-1.7143 0.43854-0.95681 0.43854-1.9136 0-1.3355-0.37874-2.6512-0.3588-1.3355-1.0963-2.392-0.71761-1.0764-1.814-1.7342-1.0963-0.65781-2.5515-0.65781z`
        }
    ],
    [
        ":",
        {
            character: ":",
            width: 5.063,
            height: 30,
            svgPath: `m3.7253e-8 27.389q0-0.75748 0.19934-1.2757 0.19934-0.53821 0.53821-0.85714 0.33887-0.33887 0.79734-0.4784 0.45847-0.15947 0.99668-0.15947 0.51827 0 0.97674 0.15947 0.47841 0.13953 0.81728 0.4784 0.33887 0.31894 0.53821 0.85714 0.19934 0.51827 0.19934 1.2757 0 0.73754-0.19934 1.2757-0.19934 0.51827-0.53821 0.85714-0.33887 0.33887-0.81728 0.49834-0.45847 0.15947-0.97674 0.15947-0.53821 0-0.99668-0.15947-0.45847-0.15947-0.79734-0.49834-0.33887-0.33887-0.53821-0.85714-0.19934-0.53821-0.19934-1.2757zm0-17.462q0-0.77741 0.19934-1.2957 0.19934-0.53821 0.53821-0.85714 0.33887-0.33887 0.79734-0.47841t0.99668-0.13953q0.51827 0 0.97674 0.13953 0.47841 0.13953 0.81728 0.47841 0.33887 0.31894 0.53821 0.85714 0.19934 0.51827 0.19934 1.2957 0 0.73754-0.19934 1.2558-0.19934 0.51827-0.53821 0.85714-0.33887 0.33887-0.81728 0.49834-0.45847 0.15947-0.97674 0.15947-0.53821 0-0.99668-0.15947-0.45847-0.15947-0.79734-0.49834-0.33887-0.33887-0.53821-0.85714-0.19934-0.51827-0.19934-1.2558z`
        }
    ],
    [
        ".",
        {
            character: ".",
            width: 5.063,
            height: 30,
            svgPath: `m-1.1176e-7 27.389q0-0.75748 0.19934-1.2757 0.19934-0.53821 0.53821-0.85714 0.33887-0.33887 0.79734-0.4784 0.45847-0.15947 0.99668-0.15947 0.51827 0 0.97674 0.15947 0.47841 0.13953 0.81728 0.4784 0.33887 0.31894 0.53821 0.85714 0.19934 0.51827 0.19934 1.2757 0 0.73754-0.19934 1.2757-0.19934 0.51827-0.53821 0.85714-0.33887 0.33887-0.81728 0.49834-0.45847 0.15947-0.97674 0.15947-0.53821 0-0.99668-0.15947-0.45847-0.15947-0.79734-0.49834-0.33887-0.33887-0.53821-0.85714-0.19934-0.53821-0.19934-1.2757z`
        }
    ],
    [
        "'",
        {
            character: "'",
            width: 4.525,
            height: 30,
            svgPath: `m4.5249 9.0152e-7 -1.0166 10.525h-2.4917l-1.0166-10.525z`
        }
    ],
    [
        "k",
        {
            character: "k",
            width: 20.586,
            height: 30,
            svgPath: `m20.586 29.399h-4.7997l-8.6704-9.4639-2.3611 2.245v7.2189h-3.6385v-30.114h3.6385v19.315l10.509-10.819h4.5868l-10.045 9.9865z`
        }
    ],
    [
        "m",
        {
            character: "m",
            width: 32.508,
            height: 30,
            svgPath: `m32.508 29.399h-3.6385v-12.309q0-1.3935-0.13548-2.6902-0.11612-1.2967-0.52255-2.0708-0.44513-0.8322-1.2773-1.258-0.83221-0.42578-2.3998-0.42578-1.5289 0-3.0579 0.77414-1.5289 0.75479-3.0579 1.9354 0.05806 0.44513 0.09677 1.0451 0.03871 0.58061 0.03871 1.1612v13.838h-3.6385v-12.309q0-1.4322-0.13548-2.7095-0.11612-1.2967-0.52255-2.0708-0.44513-0.8322-1.2773-1.2386-0.83221-0.42578-2.3998-0.42578-1.4902 0-2.9998 0.73544-1.4902 0.73544-2.9805 1.8773v16.141h-3.6385v-21.618h3.6385v2.3998q1.7031-1.4128 3.3869-2.2063 1.7031-0.7935 3.6191-0.7935 2.2063 0 3.7352 0.92897 1.5483 0.92897 2.3031 2.574 2.2063-1.8579 4.0256-2.6708 1.8192-0.83221 3.8901-0.83221 3.5611 0 5.2448 2.1676 1.7031 2.1483 1.7031 6.019z`
        }
    ]
]);

interface Bounds {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
}

type Alignment = "left" | "center" | "right";

export class Text {
    public readonly glyphs: Glyph[];

    constructor(public readonly text: string) {
        this.glyphs = Array.from(text).map(char => GLYPHS.get(char));
    }

    private static xOffset(align: Alignment, width: number): number {
        switch (align) {
            case "left":
                return 0;
            case "center":
                return -width / 2;
            case "right":
                return -width;
        }
    }

    computeBounds(glyphScaleFactor: number, xOffset: number, yOffset: number, align: Alignment): Bounds {
        let width = this.glyphs.reduce((result, glyph, index) =>
            result + glyph.width + (index > 0 ? 5 : 0), 0) * glyphScaleFactor;
        let height = this.glyphs.reduce((result, glyph) =>
            Math.max(result, glyph.height * glyphScaleFactor), 0);
        return {
            minX: xOffset + Text.xOffset(align, width),
            maxX: xOffset + width + Text.xOffset(align, width),
            minY: yOffset - height / 2,
            maxY: yOffset + height / 2
        };
    }

    toSvg(glyphScaleFactor: number, xOffset: number, yOffset: number, align: Alignment): string {
        let width = this.glyphs.reduce((result, glyph, index) =>
            result + glyph.width + (index > 0 ? 5 : 0), 0) * glyphScaleFactor;
        let xGlyphOffset: number[] = [Text.xOffset(align, width)];
        let yGlyphOffset: number[] = [];
        this.glyphs.forEach(glyph => {
            xGlyphOffset.push(xGlyphOffset[xGlyphOffset.length - 1] + (5 + glyph.width) * glyphScaleFactor);
            yGlyphOffset.push(-glyph.height * glyphScaleFactor / 2);
        });
        return `<g transform="translate(${xOffset} ${yOffset})" aria-label="${this.text}">` +
            this.glyphs
                .map((glyph, index) =>
                    `<path transform="translate(${xGlyphOffset[index]} ${yGlyphOffset[index]}) scale(${glyphScaleFactor})" d="${glyph.svgPath}"/>`)
                .reduce((svg, glyph) => svg.toString() + glyph)
            + "</g>";
    }
}

export class ScaleMark {
    constructor(
        public readonly measureLabel: Text,
        public readonly unitLabel: Text,
        public readonly xOffsetInMM: number,
        public readonly yOffsetInMM: number,
        public readonly secondary: boolean
    ) {
    }

    get bounds(): Bounds {
        let measureLabelBounds = this.measureLabel.computeBounds(this.secondary ? 0.05 : 0.07, this.xOffsetInMM, this.yOffsetInMM + (this.secondary ? 1.5 : 0), "center");
        let unitLabelBounds = this.unitLabel?.computeBounds(this.secondary ? 0.05 : 0.07, measureLabelBounds.maxX + 1.2, this.yOffsetInMM + (this.secondary ? 1.5 : 0), "left");
        return {
            minX: Math.min(measureLabelBounds.minX, unitLabelBounds?.minX ?? measureLabelBounds.minX),
            maxX: Math.max(measureLabelBounds.maxX, unitLabelBounds?.maxX ?? measureLabelBounds.maxX),
            minY: Math.min(measureLabelBounds.minY, unitLabelBounds?.minY ?? measureLabelBounds.minY),
            maxY: Math.max(measureLabelBounds.maxY, unitLabelBounds?.maxY ?? measureLabelBounds.maxY)
        };
    }

    public toSvg(): string {
        let measureLabelBounds = this.measureLabel.computeBounds(this.secondary ? 0.05 : 0.07, this.xOffsetInMM, this.yOffsetInMM + (this.secondary ? 1.5 : 0), "center");
        return `<path style="stroke:#000000;stroke-width: 0.15" d="m${this.xOffsetInMM} 2 v${this.secondary ? -1 : -2}"/>`
            + this.measureLabel.toSvg(this.secondary ? 0.05 : 0.07, this.xOffsetInMM, this.yOffsetInMM + (this.secondary ? 1.5 : 0), "center")
            + this.unitLabel?.toSvg(this.secondary ? 0.05 : 0.07, measureLabelBounds.maxX + 1.2, this.yOffsetInMM + (this.secondary ? 1.5 : 0), "left") ?? "";
    }
}

@Injectable()
export class ScaleService {
    private static formatReductionFactor(scale: Scale): string {
        return SCALES.get(scale).reductionFactor
            .toString()
            .split("")
            .reverse()
            .join("")
            .match(/[\s\S]{1,3}/g)
            .reverse()
            .map(group => group.split("").reverse().join(""))
            .join("'");
    }

    public buildScaleSvg(scale: Scale): string {
        let scaleMarks = this.buildScaleMarks(scale);
        let scaleMarksMinX = scaleMarks.reduce((result, scaleMark) => Math.min(result, scaleMark.xOffsetInMM), Number.MAX_VALUE);
        let scaleMarksMaxX = scaleMarks.reduce((result, scaleMark) => Math.max(result, scaleMark.xOffsetInMM), 0);
        let scaleMarksCenterX = (scaleMarksMinX + scaleMarksMaxX) / 2;
        let scaleText = new Text(`1:${ScaleService.formatReductionFactor(scale)}`);
        let bounds = scaleMarks.map(mark => mark.bounds);
        bounds.push(scaleText.computeBounds(0.14, scaleMarksCenterX, 5.5, "center"));
        let minX = bounds.reduce((result, bound) => Math.min(result, bound.minX), Number.MAX_VALUE) - 2;
        let maxX = bounds.reduce((result, bound) => Math.max(result, bound.maxX), 0) + 2;
        let minY = bounds.reduce((result, bound) => Math.min(result, bound.minY), Number.MAX_VALUE) - 2;
        let maxY = bounds.reduce((result, bound) => Math.max(result, bound.maxY), 0) + 2;
        return `<?xml version="1.0" encoding="UTF-8"?>\n<svg width="${round(maxX - minX, 3)}mm" height="${round(maxY - minY, 3)}mm" viewBox="${round(minX, 3)} ${round(minY, 3)} ${round(maxX - minX, 3)} ${round(maxY - minY, 3)}" xmlns=\"http://www.w3.org/2000/svg\">`
            + scaleMarks.reduce((result, scaleMark) => result + scaleMark.toSvg() + "\n", "")
            + `<path style="stroke:#000000;stroke-width: 0.15" d="m${scaleMarksMinX} 1.925 h${scaleMarksMaxX}" />`
            + scaleText.toSvg(0.1, scaleMarksCenterX, 5, "center")
            + "\n</svg>";
    }

    buildScaleMarks(scale: Scale): ScaleMark[] {
        let reductionFactor = SCALES.get(scale).reductionFactor;
        let magnitude = Math.pow(10, Math.ceil(Math.log10(10 * reductionFactor)));
        let baseUnitLengthInMapMM = magnitude / reductionFactor;
        let scaleUnitLengthInRealMM;
        if (baseUnitLengthInMapMM >= 50) {
            scaleUnitLengthInRealMM = magnitude / 5;
        } else if (baseUnitLengthInMapMM >= 30) {
            scaleUnitLengthInRealMM = magnitude / 4;
        } else if (baseUnitLengthInMapMM >= 15) {
            scaleUnitLengthInRealMM = magnitude / 2;
        } else {
            scaleUnitLengthInRealMM = magnitude;
        }
        let unitLength = scaleUnitLengthInRealMM >= 250000 ? "km" : "m";
        let scaleUnitLengthForLabel = scaleUnitLengthInRealMM >= 250000 ? scaleUnitLengthInRealMM / 1000000 : scaleUnitLengthInRealMM / 1000;
        let xOffset = scaleUnitLengthInRealMM / reductionFactor;
        let yOffset = -2;
        let scaleMarks: ScaleMark[] = [];
        for (let index = -1; index <= 4; index++) {
            scaleMarks.push(new ScaleMark(
                new Text(Math.abs(scaleUnitLengthForLabel * index).toString()),
                index == 4 ? new Text(unitLength) : undefined,
                index * xOffset,
                yOffset,
                false));
        }
        scaleMarks.push(new ScaleMark(
            new Text(Math.abs(scaleUnitLengthForLabel * -0.5).toString()),
            undefined,
            -0.5 * xOffset,
            yOffset,
            true));
        return scaleMarks.sort((scaleMark1, scaleMark2) =>
            scaleMark1.xOffsetInMM - scaleMark2.xOffsetInMM);
    }
}