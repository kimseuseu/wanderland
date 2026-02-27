import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

const GUILD_ID = process.env.DISCORD_GUILD_ID;

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'identify guilds',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.discordId = profile?.id;
        token.avatar = profile?.avatar;
        token.username = profile?.username;

        // Check guild membership
        try {
          const res = await fetch('https://discord.com/api/users/@me/guilds', {
            headers: { Authorization: `Bearer ${account.access_token}` },
          });
          if (res.ok) {
            const guilds = await res.json();
            token.isMember = guilds.some((g) => g.id === GUILD_ID);
          } else {
            token.isMember = false;
          }
        } catch {
          token.isMember = false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.isMember = token.isMember ?? false;
      session.discordId = token.discordId;
      session.user.image = token.avatar
        ? `https://cdn.discordapp.com/avatars/${token.discordId}/${token.avatar}.png`
        : null;
      session.user.name = token.username || session.user.name;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
