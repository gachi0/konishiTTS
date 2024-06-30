import { Column, DataSource, Entity, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, Unique } from "typeorm";
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
        await UserEntity.repo.findOne({ where: { id: id } }) ?? new UserEntity(id);

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

    /** 辞書 */
    @OneToMany(() => DictEntity, d => d.guildId)
    dict!: DictEntity[];

    static get repo() {
        return con.getRepository(GuildEntity);
    }

    static async get(id: string, dict = false): Promise<GuildEntity> {
        let guild = await GuildEntity.repo.findOne({ where: { id: id }, relations: dict ? ["dict"] : [] });
        if (guild) return guild;

        // なかったら
        guild = new GuildEntity(id);
        await GuildEntity.repo.save(guild);
        guild.dict = [];
        return guild;
    }

    constructor(id: string) {
        this.id = id;
    }
}

@Entity({ name: "dict" })
@Unique(["guildId", "word"])
export class DictEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => GuildEntity, g => g.id)
    guildId: string;

    @Column({ type: "varchar" })
    authorId: string;

    @Column({ type: "varchar" })
    word: string;

    @Column({ type: "varchar" })
    yomi: string;

    static get repo() {
        return con.getRepository(DictEntity);
    }

    constructor(authorId: string, word: string, yomi: string, guildId: string) {
        this.authorId = authorId;
        this.word = word;
        this.yomi = yomi;
        this.guildId = guildId;
    }
}


export const con: DataSource = new DataSource({
    type: "sqlite",
    database: "data.sqlite3",
    entities: [UserEntity, GuildEntity, DictEntity],
    synchronize: true,
    logging: true
});

export const DBInit = async () => {
    await con.initialize();
};