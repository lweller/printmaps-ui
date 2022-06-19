import {TestBed} from "@angular/core/testing";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {ConfigurationService} from "./configuration.service";
import {HttpClient} from "@angular/common/http";
import {of} from "rxjs";
import {TestScheduler} from "rxjs/testing";

describe("ConfigurationService", () => {

    const SAMPLE_CONFIGURATION = {
        printmapsApiBaseUri: "http://api.example.com/api/beta2/maps",
        defaultCoordinates: {
            latitude: 47.06,
            longitude: 8.3
        },
        autoUploadIntervalInSeconds: 5,
        mapStatePollingIntervalInSeconds: 1
    };

    let configurationService: ConfigurationService;

    let httpClient: HttpClient;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ConfigurationService]
        });

        httpClient = TestBed.inject(HttpClient);

        configurationService = TestBed.inject(ConfigurationService);

    });

    it("should successfully load configuration over http when load is called for the first time and then return configuration from cache", async () => {
        // given
        spyOn(httpClient, "get").withArgs("/local/config.json")
            .and.returnValue(of(JSON.stringify(SAMPLE_CONFIGURATION)));

        // when
        const configuration1 = await configurationService.load().toPromise();
        const configuration2 = await configurationService.load().toPromise();

        // then
        expect(configuration1)
            .withContext("loaded configuration")
            .toEqual(configuration2);
        expect(httpClient.get).toHaveBeenCalledTimes(1);
        expect(configurationService.appConf)
            .withContext("current config")
            .toEqual(configuration1);
    });

    it("should throw an error when trying to get appConfig and before it has been loaded", () => {
        // when
        const execution = () => configurationService.appConf;

        // then
        expect(execution).toThrowError("Configuration not loaded yet.");
    });

    it("should create a timer do debounce changes of a map project based on autoUploadIntervalInSeconds", () => {
        new TestScheduler((actual, expected) => {
            expect(actual).toEqual(expected);
        }).run((helpers => {
            const {expectObservable} = helpers;

            // given
            spyOnProperty(configurationService, "appConf", "get").and.returnValue(SAMPLE_CONFIGURATION);

            // when
            const timer = configurationService.autoUploadDebounceTimer();

            // then
            expectObservable(timer).toBe("5s (a|)", {a: 0});
        }));
    });

    it("should deffer a value until polling delay defined by mapStatePollingIntervalInSeconds is reached", () => {
        new TestScheduler((actual, expected) => {
            expect(actual).toEqual(expected);
        }).run((helpers => {
            const {expectObservable} = helpers;

            // given
            const SOME_ID = "some ID";
            spyOnProperty(configurationService, "appConf", "get").and.returnValue(SAMPLE_CONFIGURATION);

            // when
            const timer = configurationService.deferUntilNextMapStatePolling(SOME_ID);

            // then
            expectObservable(timer).toBe("1s (a|)", {a: SOME_ID});
        }));
    });
});