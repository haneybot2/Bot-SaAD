const { Command } = require('discord-akairo');
const { RichEmbed } = require('discord.js');
const { PREFIX: prefix } = process.env;

class BCCommand extends Command {
    constructor() {
        super('ping', {
            aliases: ['bc'],
            channelRestriction: 'guild',
            userPermissions: ['ADMINISTRATOR'],
            cooldown: 10000,
            ratelimit: 2
        });
    }

    exec(msg) {
        const args = msg.content.slice(prefix.length).split(/ +/);
        if (!args[0]) return msg.channel.send(`
** لم يتم تحديد اي مدخلات, من فضلك قم بادخال نوع الرسالة ومحتواها **
\`\`\`html
<${prefix}bc [message] : لارسال رسالة الي الاعضاء الاونلاين>
<${prefix}bc embed [message] : لارسال رسالة بامبد الي الاعضاء المتصلين, اي الذين ليسو اوفلاين>
<${prefix}bc online [message] : لارسال رسالة الي الاعضاء الاونلاين>
<${prefix}bc idle [message] : لارسال رسالة الي جيمع الاعضاء الخاملين>
<${prefix}bc dnd [message] : لارسال رسالة الي الاعضاء المشغولين>
<${prefix}bc offline [message] : لارسال رسالة الي الاعضاء الاوفلاين>
<${prefix}bc all [message] : لارسال رسالة الي جميع اعضاء السيرفر>
\`\`\`
        `);

        const opt = args[0].toLowerCase();
        switch(opt) {
            case 'embed':
                return this.SendMessageEmbed(msg, args.slice(1).join(' '));
            case 'online':
                return this.SendMessage(msg, 'online', args.slice(1).join(' '));
            case 'idle':
                return this.SendMessage(msg, 'idle', args.slice(1).join(' '));
            case 'dnd':
                return this.SendMessage(msg, 'dnd', args.slice(1).join(' '));
            case 'offline':
                return this.SendMessage(msg, 'offline', args.slice(1).join(' '));
            case 'all':
                return this.SendMessageAll(msg, args.slice(1).join(' '));

            default:
                return this.SendMessage(msg, 'all', args.join(' '));
        }
    }

    SendMessage(msg, type, messageSending)  {
        if (!messageSending) return msg.channel.send('**من فضلك قم بكتابة الرسالة**');
        let filter;
        if (type === 'online') filter = member => member.presence.status === 'online' && !member.user.bot;
        else if (type === 'idle') filter = member => member.presence.status === 'idle' && !member.user.bot;
        else if (type === 'dnd') filter = member => member.presence.status === 'dnd' && !member.user.bot;
        else if (type === 'offline') filter = member => member.presence.status === 'offline' && !member.user.bot;
        else if (type === 'all') filter = member => member.presence.status !== 'offline' && !member.user.bot;
        else return;

        const members = msg.guild.members.filter(filter);
        if (members.size === 0) return msg.channel.send('**لم اتملكن من ان اجد اي عضو لديه هذه الحالة**');
        let index = 0;
        members.forEach(member => {
            try {
                member.send(messageSending.replace("[user]", member).replace("<user>", member));
                if (msg.attachments.first()) {
                    member.send({
                        files: [{
                            attachment: msg.attachments.first().url,
                            name: 'bc.png'
                        }]
                    });
                }
            } catch(err) {
                ++index;
            }
        });
        index = members.size - index;
        if (index === 0) return msg.channel.send('**لا استطيع ارسال الرسالة الي اي شخص لديه هذه الحالة**');
        let str = `اشخاص \`${index}\` تم ارسال رسالتم الي `;
        await msg.channel.send(index === 1 ? '**تم ارسال رسالتك الي شخص واحد**' : (index === 2 ? '**تم ارسال رسالتك الي شخصين**' : str));
    }

    SendMessageEmbed(msg, messageSending) {
        if (!messageSending) return msg.channel.send('**من فضلك قم بكتابة الرسالة**');
        const members = msg.guild.members.filter(member => member.presence.status !== 'offline' && !member.user.bot);
        if (members.size === 0) return msg.channel.send('**ام اتملكن من ان اجد اي عضو لديه هذه الحالة**');
        let index = 0;
        const embed = new RichEmbed()
            .setColor('#ffae97')
            .setThumbnail(msg.guild.iconURL)
            .addField('⚪ From', msg.guild.name, true);
        members.forEach(member => {
            try {
                member.send(
                    embed.setAuthor(member.user.username, member.user.avatarURL).addField('⚪ To', member, true).addField('Message', messageSending.replace("[user]", member).replace("<user>", member), true)
                );
                if (msg.attachments.first()) {
                    member.send({
                        files: [{
                            attachment: msg.attachments.first().url,
                            name: 'bc.png'
                        }]
                    });
                }
            } catch(err) {
                ++index;
            }
        });
        index = members.size - index;
        if (index === 0) return msg.channel.send('**لا استطيع ارسال الرسالة الي اي شخص لديه هذه الحالة**');
        let str = `اشخاص \`${index}\` تم ارسال رسالتم الي `;
        await msg.channel.send(index === 1 ? '**تم ارسال رسالتك الي شخص واحد**' : (index === 2 ? '**تم ارسال رسالتك الي شخصين**' : str));
    }

    SendMessageAll(msg, messageSending) {
        if (!messageSending) return msg.channel.send('**من فضلك قم بكتابة الرسالة**');
        const members = msg.guild.members.filter(member => !member.user.bot);
        if (members.size === 0) return msg.channel.send('**يبدو انه لا يوجد احد في السيرفر, هذا يفسر لماذا لم اتمكن من اجد اي شخص في هذا السيرفر**');
        let index = 0;
        members.forEach(member => {
            try {
                member.send(messageSending.replace("[user]", member).replace("<user>", member));
                if (msg.attachments.first()) {
                    member.send({
                        files: [{
                            attachment: msg.attachments.first().url,
                            name: 'bc.png'
                        }]
                    });
                }
            } catch(err) {
                ++index;
            }
        });
        index = members.size - index;
        if (index === 0) return msg.channel.send('**لا يمكنني ان رسل هذه الرسالة الي اي شخص في هذا السيرفر**');
        let str = `اشخاص \`${index}\` تم ارسال رسالتم الي `;
        await msg.channel.send(index === 1 ? '**تم ارسال رسالتك الي شخص واحد**' : (index === 2 ? '**تم ارسال رسالتك الي شخصين**' : str));
    }
}

module.exports = BCCommand;
