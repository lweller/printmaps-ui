import {Injectable} from "@angular/core";
import {Configuration} from "../model/intern/configuration";
import {EMPTY, Observable, of, timer} from "rxjs";
import {environment} from "../../environments/environment";
import {catchError, delay, tap} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";

export function configurationServiceInitializerFactory(configurationService: ConfigurationService): Function {
    return () => configurationService.load();
}

@Injectable({
    providedIn: "root"
})
export class ConfigurationService {
    private configuration: Configuration;
    private loaded = false;

    constructor(private readonly http: HttpClient) {
    }

    public get appConf() {
        if (!this.loaded) {
            throw Error("Configuration not loaded yet.");
        }
        return this.configuration;
    }

    public autoUploadDebounceTimer(): Observable<number> {
        return timer(this.appConf.autoUploadIntervalInSeconds * 1000);
    }

    public deferUntilNextMapStatePolling(id: string): Observable<string> {
        return of(id).pipe(delay(this.appConf.mapStatePollingIntervalInSeconds * 1000));
    }

    public load(): Observable<Configuration> {
        let configFile = environment.production ? "/conf/config.json" : "/local/config.json";
        if (this.loaded) {
            return of(this.configuration);
        } else {
            return this.http.get<Configuration>(configFile)
                .pipe(
                    tap(configuration => this.cacheLoadedConfiguration(configFile, configuration)),
                    catchError(() => {
                        console.log(`Failed to load configuration. Check that a valid '${configFile}' file is provided.`);
                        return EMPTY;
                    })
                );
        }
    }

    private cacheLoadedConfiguration(configFile: string, configuration: Configuration) {
        console.log(`Successfully loaded configuration from '${configFile}'.`);
        this.configuration = configuration;
        this.loaded = true;
    }
}