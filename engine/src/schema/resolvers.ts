import {
  GraphQLField,
  GraphQLFieldResolver,
  GraphQLNonNull,
  GraphQLList,
  isAbstractType,
  isLeafType,
  GraphQLEnumType
} from "graphql";

type Resolver<TSource> = (
  type: TSource,
  field?: GraphQLField<TSource, any>
) => GraphQLFieldResolver<TSource, any>;

type FieldResolver = Resolver<any>;
type LeafResolver = Resolver<any>;
type EnumResolver = Resolver<any>;
type ScalarResolver = Resolver<any>;
type PrimitiveResolver = Resolver<any>;

export const fieldResolver: FieldResolver = (type, field) => {
  if (type instanceof GraphQLNonNull) {
    return fieldResolver(type.ofType, field);
  }

  if (type instanceof GraphQLList) {
    return (source, context, args, info) => [
      fieldResolver(type.ofType, field)(source, context, args, info)
    ];
  }

  if (isAbstractType(type)) {
    return () => ({ __typename: type.name });
  }

  if (isLeafType(type)) {
    return leafResolver(type);
  }

  return () => ({});
};

const leafResolver: LeafResolver = type =>
  type instanceof GraphQLEnumType
    ? enumResolver(type)
    : scalarResolver(type) || (() => `<${type.name}>`);

const enumResolver: EnumResolver = type => () => type.getValues()[0].value;

const scalarResolver: ScalarResolver = type => primitiveResolver(type);

const primitiveResolver: PrimitiveResolver = type =>
  primitiveResolvers[type.name];

const primitiveResolvers: {
  [name: string]: () => boolean | number | string;
} = {
  Boolean: () => true,
  Float: () => 12.34,
  ID: () => "ID",
  Int: () => 1234,
  String: () => "Hello, World!"
};

export const primitiveNames = Object.keys(primitiveResolvers);