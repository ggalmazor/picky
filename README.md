# (nit)Picky

![CI](https://github.com/ggalmazor/picky/actions/workflows/ci.yml/badge.svg)

(nit)Picky explains the acronyms that you use in Slack:
- Invite Picky to a channel, and it will listen to messages
- Picky will write a message with a definition whenever someone uses an acronym 
- Picky remembers all the acronyms that it defines. However, Picky makes up random definitions, so you better teach it the good ones!

<a href="https://slack.com/oauth/v2/authorize?client_id=7828417850918.7820563959399&scope=app_mentions:read,channels:history,chat:write,im:history,im:write,reactions:write,team:read&user_scope="><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>

## How can Picky help your team?

Picky can make it easier for new team members by allowing them to understand what everybody else is talking about.

At Picky we're big fans of the "expose your ignorance" principle, but having the option to privately ask Picky about acronyms removes the awkwardness from the equation while a new team member gains confidence to do so in a public environment.

Here are some specific scenarios where Picky can help:

- **Onboarding of new team members**: Onboarding new team members into the domain-specific language and idioms of a team is easier when Picky can explain the acronyms used by others.

- **Helping non-native speakers blend in**: Non-native speaker team members might struggle with acronyms commonly used in the main language that's used to communicate in Slack. With Picky, you can finally what IIRC or BBIAB mean 🤷‍♀️.
- **Ensure everyone's talking about the same thing**: Just in case, Picky can help focus the conversation on the same topic by explicitly communicating what the acronym really means. Was it "Continuous Delivery" or "Continuous Deployment"? 

## Commands

- [Learn an acronym](#learn)
- [Forget an acronym](#forget)
- [Replace an acronym](#replace)
- [Define an acronym](#define)
- [Ignore an acronym](#ignore)
- [Stop ignoring an acronym](#stop-ignoring)
- [List acronyms](#list)

---

### Learn

Picky can learn new acronym definitions.

Usage: `learn <acronym> <definition>`

Example: `@picky learn HTML How To Make Lasagna`

---

### Forget

Picky can forget acronyms and their definitions.

Usage: `forget <acronym> [definition]`

Example: `@picky forget HTML How To Make Lasagna`

Picky can also forget the acronym along with all existing definitions by omitting the definition in this command.

Example: `@picky forget HTML`

---

### Replace

Picky can replace all existing definitions of an acronym with a new one.

Usage: `@picky replace <acronym> <definition>`

Example: `@picky replace HTML How To Make Lasagna`

This command is a combination of:
```
@picky forget HTML
@picky learn HTML How To Make Lasagna
```

---

### Define

Picky can provide the definition of acronyms.

Usage: `@picky define <acronym>`

Example: `@picky define HTML`

Responds with: ``HTML stands for: `How To Make Lasagna` ``

---

### Ignore

Picky can ignore acronyms when people use them in chats.

Usage: `@picky ignore <acronym>`

Example: `@picky ignore HTML`

---

### Stop ignoring

Picky can resume defining ignored acronyms.

Usage: `@picky stop ignoring <acronym>`

Example: `@picky stop ignoring HTML`

---

### List

Picky can list all the acronyms it knows with their definitions, and tells you if they're ignored.

Usage: `@picky list [ignored]`

Example: `@picky list`

Responds with: 
```
API stands for `Another Programmer’s Issue`
HTML (ignored) stands for `How To Make Lasagna`
```

Picky can also list only the ignored acronym by adding `ignored` to the command.

Example: `@picky list ignored`

Responds with:
```
HTML (ignored) stands for `How To Make Lasagna`
```
