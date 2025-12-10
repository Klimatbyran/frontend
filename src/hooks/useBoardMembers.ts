import { useTranslation } from "react-i18next";

interface BoardMember {
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}
export const useBoardMembers = () => {
  const { t } = useTranslation();

  const boardMembers: BoardMember[] = [
    {
      name: "Ola Spännar",
      role: t("board.ola.role"),
      description: t("board.ola.description"),
      imageUrl: "/people/ola.jpg",
    },
    {
      name: "Frida Berry Eklund",
      role: t("board.frida.role"),
      description: t("board.frida.description"),
      imageUrl: "/people/frida.jpg",
    },
    {
      name: "Maria Soxbo",
      role: t("board.maria.role"),
      description: t("board.maria.description"),
      imageUrl: "/people/maria.jpg",
    },
    {
      name: "Carl-Johan Schultz",
      role: t("board.carlJohan.role"),
      description: t("board.carlJohan.description"),
      imageUrl: "/people/carl-johan.jpg",
    },
    {
      name: "Madeleine van der Veer",
      role: t("board.madeleine.role"),
      description: t("board.madeleine.description"),
      imageUrl: "/people/madeleine.png",
    },
  ];

  return boardMembers;
};
