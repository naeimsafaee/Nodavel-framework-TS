import Controller from "./Controller";
import express, {NextFunction, Router} from "express";
import Middleware from "./Middelware";
import FormRequest from "./FormRequest";
import Validator from "./Validator";
import * as core from "express-serve-static-core";
require("express-async-errors");

type Class<T> = new (...args: any[]) => T

enum Methods {
    GET,
    PUT,
    POST,
    DELETE
}

class RouteBuilder<T extends Controller> {

    private _middlewares: Array<(req: express.Request, res: express.Response, next: express.NextFunction) => void> = [];

    options: { controller: any, func: string };
    method: Methods;

    uri: string = "";

    constructor(method: Methods, uri: string, options: { controller: any, func: string }) {

        this.options = options;
        this.method = method;
        this.uri += uri;
    }

    public middleware<M extends Middleware>(middleware: Class<Middleware>) {
        this._middlewares.push(new middleware().handle)
        return this;
    }

    public middlewares<M extends Middleware>(...middleware: Array<Class<Middleware>>) {
        for (let i = 0; i < middleware.length; i++) {
            this._middlewares.push(new middleware[i]().handle)
        }
        return this;
    }

    public build(router: Router) {

        if (this.method == Methods.GET) {
            router.get(this.uri, this._middlewares, async (req: express.Request, res: express.Response) => {

                const result = this.handleRoute(req);

                return res.send(result)
            });
        } else if (this.method == Methods.POST) {
            router.post(this.uri, this._middlewares, async (req: express.Request, res: express.Response , next:NextFunction) => {

                // try {
                const result = await this.handleRoute(req);

                return res.send(result);
                /*} catch (err){
                    next(err);
                }*/

            })
        } else if (this.method == Methods.DELETE) {
            router.delete(this.uri, this._middlewares, async (req: express.Request, res: express.Response) => {

                const result = this.handleRoute(req);

                return res.send(result)
            })
        } else if (this.method == Methods.PUT) {
            router.put(this.uri, this._middlewares, async (req: express.Request, res: express.Response) => {

                const result = await this.handleRoute(req);

                return res.send(result)
            })
        }

    }

    private async handleRoute(req: express.Request) {
        const {controller, func} = this.options;

        const controllerInstance = new controller();
        const controllerFunc = controllerInstance[func];

        const params = await this.detectParameters(req, controllerInstance, func);

        const result = controllerFunc.apply(controllerInstance, params);

        console.log(result);

        return result;
    }

    private detectParameters(req: express.Request, controllerInstance: any, func: string) {

        const paramsMetadata = Reflect.getMetadata(`${func}_params`, controllerInstance) || {};
        const bodyMetadata = Reflect.getMetadata(`${func}_body`, controllerInstance) || {};

        const bodyIndex = Object.keys(bodyMetadata)[0];
        const requestIndex = Reflect.getMetadata(`${func}_request`, controllerInstance);


        const params = this.handleParams(requestIndex , req , paramsMetadata)

        const body = this.handleBody(bodyIndex , req , bodyMetadata)

        let mainParams = [...body , ...params];

        console.log({mainParams})

        return mainParams;
    }

    handleParams(requestIndex: any, req: express.Request, paramsMetadata: any){

        const params = Object.keys(paramsMetadata).map((index) => {
            if (Number(index) === requestIndex) {
                return req;
            }
            const paramName = paramsMetadata[index];
            return req.params[paramName];
        });

        return params;
    }

    private handleBody(bodyIndex: any, req: express.Request, bodyMetadata: any) {
        const body = [];

        if (bodyIndex !== undefined) {
            const formRequestInstance = bodyMetadata[bodyIndex] as unknown as FormRequest;

            if (formRequestInstance) {
                new Validator(formRequestInstance).validate(req.body);
            }

            body.push(req.body);
        }
        return body;
    }
}

class Route {

    routes: Array<RouteBuilder<Controller>> = [];

    private router: core.Router = express.Router();

    private app: express.Application = express.application;

    private prefix = "";

    public get_router(): core.Router {
        return this.router;
    }

    public register_app(app: express.Application, uri: string = "/") {
        this.app = app;

        for (let i = 0; i < this.routes.length; i++) {
            this.routes[i].build(this.router)
        }

        this.app.use(uri, this.get_router())

        return this;
    }

    public post<T extends Controller>(uri: string, options: { controller: new() => T, func: string }): RouteBuilder<Controller> {

        const builder = new RouteBuilder(Methods.POST, uri, options);

        this.routes.push(builder)
        return builder;
    }

    public get<T extends Controller>(uri: string, options: { controller: new() => T, func: string }): RouteBuilder<Controller> {

        const builder = new RouteBuilder(Methods.GET, this.prefix + uri, options);

        this.routes.push(builder)
        return builder;
    }

    public delete<T extends Controller>(uri: string, options: { controller: new() => T, func: string }): RouteBuilder<Controller> {

        const builder = new RouteBuilder(Methods.DELETE, uri, options);

        this.routes.push(builder)
        return builder;
    }

    public put<T extends Controller>(uri: string, options: { controller: new() => T, func: string }): RouteBuilder<Controller> {

        const builder = new RouteBuilder(Methods.PUT, uri, options);

        this.routes.push(builder)
        return builder;
    }

    public group(prefix: string, cb: () => void) {

        this.prefix = prefix;
        cb()

        this.prefix = "";
    }

    public print_routes() {

        for (let i = 0; i < this.routes.length; i++) {
            const route = this.routes[i];

            // Adjust the desired padding length
            const method = `${Methods[route.method]}`.padEnd(20, ' ');
            const url = `${route.uri}`;
            const uri = `${route.options.controller.name} > ${route.options.func}`;

            // console.log(`${route.uri}       ${Methods[route.method]}`)
            console.log(`${method} ${url}  ${`.`.repeat(20).padEnd(10, '')} ${uri}`);

        }
    }

}

export default Route