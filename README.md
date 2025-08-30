[![Discord](https://img.shields.io/discord/1006372235172384849?style=for-the-badge&logo=5865F2&logoColor=black&labelColor=black&color=%23f3f3f3
)](https://discord.gg/ENB7RbxVZE)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge&logo=5865F2&logoColor=black&labelColor=black&color=%23f3f3f3)](https://github.com/AndrewShedov/mongoChecker/blob/main/LICENSE)

# mongoChecker

CLI tool for searching duplicate values in a MongoDB collection by a chosen field.

### Features
- Finds duplicates by any user-defined field (**"createdAt"**, **"text"**, **"price"**, etc).
- Dates are formatted as ISO; arrays/objects are output via JSON.stringify.
- Works with a configuration file containing: <code>uri</code>, <code>db</code>, <code>collection</code>, <code>field</code>, <code>allowDiskUse</code>, <code>maxDuplicatesToShow</code>.
- Informative logs:
<img src="https://raw.githubusercontent.com/AndrewShedov/mongoChecker/refs/heads/main/assets/screenshot_1.png" width="450" />

In the screenshot, an example of checking the collection **"posts"** (10,000,000 documents) by field **"createdAt"**.
### How it works
**Aggregation pipeline:**

```js
const duplicates = await coll.aggregate(
        [
          { $group: { _id: `$${field}`, count: { $sum: 1 } } },
          { $match: { count: { $gt: 1 } } },
          { $sort: { count: -1 } }
        ],
        { allowDiskUse }
      ).toArray();
```

<code>_id</code> in the group stage → the field value (date/string/number/object/array).

**Output formatting:** <br/>
Date → <code>ISO string</code><br/>
Array/Object → <code>JSON.stringify</code><br/>
Other → <code>String(value)</code><br/>

### Installation & Usage
1. Install the package:

```bash
npm i mongo-checker
```

2. Add a script in your **package.json**:

```json
"scripts": {
  "mongoChecker": "mongo-checker"
}
```

3. In the root of the project, create a file - **[mongo-checker.config.js](https://github.com/AndrewShedov/mongoChecker/blob/main/config%20example/mongo-checker.config.js)**.

Example of file contents:

```js
export default {
  uri: "mongodb://127.0.0.1:27017",
  db: "crystal",
  collection: "posts",
  field: "createdAt",
  allowDiskUse: false,
  maxDuplicatesToShow: 3
};
```

**⚠️ All parameters are required — if any is missing, the tool will throw an error.**

4. Run from the project root:
   
```bash
npm run mongoChecker
```

### Config parameters

<code>allowDiskUse: true</code>

**MongoDB is allowed to use temporary disk space for intermediate data.** <br/>

**When to enable:** <br/>
- With a small amount of RAM.<br/>
- For large collections (tens of millions of documents or more), to avoid out-of-memory errors.<br/>

**Drawbacks:** <br/>

- Disk is slower than RAM → query execution can be significantly slower.
- If the disk is heavily used, other operations may slow down as well.

<code>allowDiskUse: false</code>

**MongoDB processes data only in RAM.** <br/>

- For small collections (up to ~1M documents), this is usually faster.
- For huge collections, the operation may fail with an out-of-memory error.

In-memory operations are often much faster than disk-based ones - **allowDiskUse: true**.

<code>maxDuplicatesToShow</code>

Limits the maximum number of duplicate values displayed in the output.

[SHEDOV.TOP](https://shedov.top/) | [CRYSTAL](https://crysty.ru/AndrewShedov) | [Discord](https://discord.gg/ENB7RbxVZE) | [Telegram](https://t.me/ShedovChannel) | [X](https://x.com/AndrewShedov) | [VK](https://vk.com/shedovclub) | [VK Video](https://vkvideo.ru/@shedovclub) | [YouTube](https://www.youtube.com/@AndrewShedov)
