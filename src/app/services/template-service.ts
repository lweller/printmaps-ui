import {Injectable} from "@angular/core";
import {MapProject} from "../model/intern/map-project";
import {template} from "lodash";
import {MAP_STYLES} from "../model/api/map-rendering-job-definition";


@Injectable()
export class TemplateService {
    compile(mapProject: MapProject, text: string): string {
        let parameters = {
            project_name: mapProject.name,
            attribution: MAP_STYLES.get(mapProject.options.mapStyle).attribution
        };
        try {
            return template(text)(parameters);
        } catch (error) {
            return text;
        }
    }
}
