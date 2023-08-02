import 'reflect-metadata';
import FormRequest from './Http/FormRequest'
import Exception from "./Exceptions/Exception";
import Middleware from "./Http/Middelware";
import Route from "./Http/Route";

type Class<T> = new (...args: any[]) => T

function Param(paramName: string): ParameterDecorator {
    return function (target: any, key: string | symbol, index: number) {
        const metadataKey = `${key.toString()}_params`;
        const metadata = Reflect.getMetadata(metadataKey, target) || {};
        metadata[index] = paramName;
        Reflect.defineMetadata(metadataKey, metadata, target);
    };
}

function Request(request: Class<FormRequest>|null = null): ParameterDecorator {
    return function (target: any, key: string | symbol, index: number) {
        const metadataKey = `${key.toString()}_body`;
        const metadata = Reflect.getMetadata(metadataKey, target) || {};
        metadata[index] = request ? new (request as new () => any)() : undefined;
        Reflect.defineMetadata(metadataKey, metadata, target);
    };
}

export {Route, Middleware, FormRequest , Exception , Param , Request};