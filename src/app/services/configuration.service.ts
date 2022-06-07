import {Injectable} from "@angular/core";
import {Configuration} from "../model/intern/configuration";
import {Observable, of, timer} from "rxjs";
import {environment} from "../../environments/environment";
import {delay} from "rxjs/operators";

export function configurationServiceInitializerFactory(configurationService: ConfigurationService): Function {
    return () => configurationService.load();
}

@Injectable({
    providedIn: "root"
})
export class ConfigurationService {
    private configuration: Configuration;
    private loaded = false;

    public get appConf() {
        if (!this.load()) {
            throw new Error("Configuration not loaded yet.");
        }
        return this.configuration;
    }

    public autoUploadDebounceTimer(): Observable<number> {
        return timer(this.appConf.autoUploadIntervalInSeconds * 1000);
    }

    public returnAfterPollingDelay(id: string): Observable<string> {
        return of(id).pipe(delay(this.appConf.mapStatePollingIntervalInSeconds * 1000));
    }

    public load(): Promise<Configuration> {
        let configFile = environment.production ? "/conf/config.json" : "/local/config.json";
        if (this.loaded) {
            return of(this.configuration).toPromise();
        } else {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", configFile);
                xhr.addEventListener("readystatechange", () => {
                    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                        console.log(`Successfully loaded configuration from '${configFile}'.`);
                        this.configuration = JSON.parse(xhr.responseText);
                        this.loaded = true;
                        resolve(this.configuration);
                    } else if (xhr.readyState === XMLHttpRequest.DONE) {
                        console.log(`Failed to load configuration. Check that a valid '${configFile}' file is provided.`);
                        reject();
                    }
                });
                xhr.send(null);
            });
        }
    }
}