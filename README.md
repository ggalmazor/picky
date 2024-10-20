# (nit)Picky

![CI](https://github.com/ggalmazor/picky/actions/workflows/ci.yml/badge.svg)

(nit)Picky explains the acronyms that you use in Slack:
- Invite Picky to a channel, and it will listen to what you say
- Picky will define an acronym when someone uses it.
- Picky remembers all the acronyms that have been explained. However, Picky makes up random definitions, so you better teach it the good ones!

<a href="https://slack.com/oauth/v2/authorize?client_id=7828417850918.7820563959399&scope=app_mentions:read,channels:history,chat:write,im:history,im:write,reactions:write,team:read&user_scope="><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>

## Commands: Learn new acronym definition

You can teach Picky new acronym definitions:
```
@picky learn <acronym> <definition>
```

Picky will add a ✅ reaction when it's done and it will use it along with any other existing definition when explaining the acronym.

## Commands: Forget an acronym definition

You can make Picky forget acronym definitions:
```
@picky forget <acronym> [definition]
```

If no `definition` is provided, then Picky will forget the acronym along with any existing definitions. 

Picky will add a ✅ reaction when it's done and it will stop using it along when explaining the acronym.

## Commands: Replace the definitions of an existing acronym

You can make Picky replace all existing definitions of an acronym with a new one:
```
@picky replace <acronym> [definition]
```

This command is a combination of:
```
@picky forget <acronym>
@picky learn <acronym> <definition>
```

Picky will add a ✅ reaction when it's done and will use the new definition moving forward.

## Commands: Define an acronym

You can make Picky define an acronym:
```
@picky define <acronym>
```

Picky will reply in the same channel with definitions for the provided acronym. It will also add a note if the acronym is ignored.

## Commands: Ignore an acronym

You can make Picky ignore an acronym:
```
@picky ignore <acronym>
```

Picky will add a ✅ reaction when it's done and it won't define it when someone includes it in a message.

## Commands: Stop ignoring an acronym

You can make Picky stop ignoring an acronym:
```
@picky stop ignoring <acronym>
```

Picky will add a ✅ reaction when it's done and it won't ignore it when someone includes it in a message.

## Commands: List acronyms

You can ask Picky to list all acronyms it knows:
```
@picky list [ignored]
```

Picky will respond with a message with all the acronyms it knows with their definitions. It will also add a note in ignored acronyms.

If you add ` ignored` to the command, it will only list the ignored acronyms.


