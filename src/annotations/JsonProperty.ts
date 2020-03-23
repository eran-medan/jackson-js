import {getArgumentNames, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonPropertyDecorator, JsonPropertyOptions} from '../@types';

export enum JsonPropertyAccess {
  WRITE_ONLY,
  READ_ONLY,
  READ_WRITE,
  AUTO
}

export const JsonProperty: JsonPropertyDecorator = makeJacksonDecorator(
  (o: JsonPropertyOptions = {}): JsonPropertyOptions => ({
    enabled: true,
    required: false,
    access: JsonPropertyAccess.AUTO,
    ...o
  }),
  (options: JsonPropertyOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!options.value && !options.defaultValue && propertyKey != null) {
      options.defaultValue = propertyKey.toString();
    }
    options.value = (options.value) ? options.value : options.defaultValue;

    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      if (!options.value && !options.defaultValue) {
        const argNames = getArgumentNames(target);
        options.defaultValue = argNames[descriptorOrParamIndex];
      }
      options.value = (options.value) ? options.value : options.defaultValue;
      Reflect.defineMetadata('jackson:JsonPropertyParam:' + descriptorOrParamIndex.toString(), options, target);
    }

    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonProperty', options, target, propertyKey);
      Reflect.defineMetadata('jackson:JsonProperty:' + propertyKey.toString(), options, target.constructor);
    }
  });
