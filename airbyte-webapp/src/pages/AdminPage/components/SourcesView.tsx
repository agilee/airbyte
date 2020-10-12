import React, { useMemo, useState } from "react";
import { FormattedMessage } from "react-intl";
import { CellProps } from "react-table";
import { useFetcher, useResource } from "rest-hooks";

import Table from "../../../components/Table";
import ConnectorCell from "./ConnectorCell";
import ImageCell from "./ImageCell";
import VersionCell from "./VersionCell";
import ConnectionResource from "../../../core/resources/Connection";
import config from "../../../config";
import { Block, Title, FormContent, FormContentTitle } from "./PageComponents";
import SourceResource from "../../../core/resources/Source";

const SourcesView: React.FC = () => {
  const { connections } = useResource(ConnectionResource.listShape(), {
    workspaceId: config.ui.workspaceId
  });

  const { sources } = useResource(SourceResource.listShape(), {
    workspaceId: config.ui.workspaceId
  });

  const [feedbackList, setFeedbackList] = useState<any>({});

  const updateSource = useFetcher(SourceResource.updateShape());
  const onUpdateVersion = async ({
    id,
    version
  }: {
    id: string;
    version: string;
  }) => {
    try {
      await updateSource(
        {},
        {
          sourceId: id,
          dockerImageTag: version
        }
      );
      setFeedbackList({ ...feedbackList, [id]: "success" });
    } catch (e) {
      setFeedbackList({ ...feedbackList, [id]: "error" });
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: <FormattedMessage id="admin.connectors" />,
        accessor: "name",
        customWidth: 34,
        Cell: ({ cell }: CellProps<{}>) => (
          <ConnectorCell connectorName={cell.value} />
        )
      },
      {
        Header: <FormattedMessage id="admin.image" />,
        accessor: "dockerRepository",
        customWidth: 36,
        Cell: ({ cell, row }: CellProps<{ documentationUrl: string }>) => (
          <ImageCell
            imageName={cell.value}
            link={row.original.documentationUrl}
          />
        )
      }
    ],
    []
  );
  const columnsCurrentSources = React.useMemo(
    () => [
      ...columns,
      {
        Header: (
          <FormContentTitle>
            <FormattedMessage id="admin.version" />
          </FormContentTitle>
        ),
        accessor: "dockerImageTag",
        collapse: true,
        Cell: ({ cell, row }: CellProps<{ sourceId: string }>) => (
          <VersionCell
            version={cell.value}
            id={row.original.sourceId}
            onChange={onUpdateVersion}
            feedback={feedbackList[row.original.sourceId]}
          />
        )
      }
    ],
    [columns, feedbackList, onUpdateVersion]
  );

  const columnsAllSources = React.useMemo(
    () => [
      ...columns,
      {
        Header: "",
        accessor: "version",
        collapse: true,
        Cell: () => <FormContent />
      }
    ],
    [columns]
  );

  const usedSources = useMemo(
    () =>
      connections.map(item => {
        const sourceInfo = sources.find(
          source => source.sourceId === item.source?.sourceId
        );
        return {
          name: item.source?.sourceName,
          sourceId: item.source?.sourceId,
          dockerRepository: sourceInfo?.dockerRepository,
          dockerImageTag: sourceInfo?.dockerImageTag,
          documentationUrl: sourceInfo?.documentationUrl,
          feedback: ""
        };
      }),
    [connections, sources]
  );

  return (
    <>
      {connections.length ? (
        <Block>
          <Title bold>
            <FormattedMessage id="admin.manageSource" />
          </Title>
          <Table columns={columnsCurrentSources} data={usedSources} />
        </Block>
      ) : null}

      <Block>
        <Title bold>
          <FormattedMessage id="admin.availableSource" />
        </Title>
        <Table columns={columnsAllSources} data={sources} />
      </Block>
    </>
  );
};

export default SourcesView;