import { Column, Connection, createConnection, Entity, PrimaryColumn } from "typeorm";
import { config } from "./bot";

@Entity({ name: "user" })
export class UserEntity {
    @PrimaryColumn({ type: "varchar" })
    id: string;

    /** 喋る人 */
    @Column({ type: "smallint", nullable: true })
    speaker?: number;

    /** 自分のメッセージを読み上げるかどうか */
    @Column({ type: "boolean", default: true })
    isRead = true;

    static get repo() {
        return con.getRepository(UserEntity);
    }

    static get = async (id: string) =>
        await UserEntity.repo.findOne(id) ?? new UserEntity(id);

    constructor(id: string) {
        this.id = id;
    }
}

@Entity({ name: "guild" })
export class GuildEntity {
    @PrimaryColumn({ type: "varchar" })
    id: string;

    /** 最大で読み上げる文字数 */
    @Column({ type: "smallint", default: config.readMaxCharDefault })
    maxChar = config.readMaxCharDefault;

    /** 名前を読み上げるかどうか */
    @Column({ type: "boolean", default: false })
    readName = false;

    /** ボイスチャンネルに参加してきた人の名前を読み上げるかどうか */
    @Column({ type: "boolean", default: true })
    joinerReadName = true;

    /** ボイスチャンネルに人が参加してきた時に読み上げる文字列 */
    @Column({ type: "text", default: "よお{name}" })
    joinerText = "よお{name}";

    /** 喋る人 */
    @Column({ type: "smallint", default: 0 })
    speaker = 0;

    /** 読み上げのスピード (0.5~2.0) */
    @Column({ type: "float", default: 1 })
    speed = 1;

    static get repo() {
        return con.getRepository(GuildEntity);
    }

    static get = async (id: string) =>
        await GuildEntity.repo.findOne(id) ?? new GuildEntity(id);

    constructor(id: string) {
        this.id = id;
    }
}

export let con: Connection;
export const DBInit = async () => {
    con = await createConnection({
        type: "sqlite",
        database: "data.sqlite3",
        entities: [UserEntity, GuildEntity],
        synchronize: true,
        logging: true
    });
};