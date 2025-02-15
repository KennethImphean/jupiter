import OrgInfoSegment from '@src/components/OrgInfoSegment';
import OrgHeader from '@src/components/OrgHeader';
import React from 'react';
import Head from 'next/head';
import ClubDocuments from '@src/components/ClubDocuments';
import Header from '@src/components/Header';

const OrganizationPage = ({
  clubId,
}: InferGetStaticPropsType<typeof getStaticProps>) => {
  const { data: club } = api.club.byId.useQuery({ id: clubId });
  if (!club) {
    return <div>Club not found</div>;
  }
  return (
    <>
      <Head>
        <title>{club.name} - Jupiter</title>
        <meta name="description" content={`${club.name} - Jupiter`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-full md:pl-72">
        <Header />
        <div className="flex flex-col space-y-8 px-5">
          <OrgHeader club={club} />
          <OrgInfoSegment club={club} />
          <ClubDocuments />
        </div>
      </main>
    </>
  );
};

export default OrganizationPage;

import {
  type GetStaticPaths,
  type InferGetStaticPropsType,
  type GetServerSidePropsContext,
} from 'next';
import { createServerSideHelpers } from '@trpc/react-query/server';
import { appRouter } from '@src/server/api/root';
import { createInnerTRPCContext } from '@src/server/api/trpc';
import { api } from '@src/utils/api';
import { db } from '@src/server/db';

export const getStaticPaths: GetStaticPaths = async () => {
  const clubs = await db.query.club.findMany();
  if (!clubs)
    return {
      paths: [],
      fallback: false,
    };

  const paths = clubs.map((club) => ({
    params: { clubId: club.id },
  }));

  return {
    paths,
    fallback: false,
  };
};
export const getStaticProps = async (
  ctx: GetServerSidePropsContext<{ clubId: string }>,
) => {
  const helper = createServerSideHelpers({
    router: appRouter,
    ctx: createInnerTRPCContext({ session: null }),
  });
  const clubId = ctx.params?.clubId;
  if (typeof clubId !== 'string')
    return {
      notFound: true,
    };

  await helper.club.byId.prefetch({ id: clubId });
  return {
    props: {
      trpcState: helper.dehydrate(),
      clubId,
    },
  };
};
