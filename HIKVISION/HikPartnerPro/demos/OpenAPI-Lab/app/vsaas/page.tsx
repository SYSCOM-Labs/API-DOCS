export default function Page() {
  return (
    <>
      <header className="page-head">
        <h2>VSaaS</h2>
        <p>
          Live view, playback, descarga e intercom de cámara no forman parte del OpenAPI REST. El
          capítulo 2.7 indica HPNetSDK (guía aparte). No hay endpoint /api/hpcgw para vídeo.
        </p>
      </header>
      <section className="neu">
        <h3>Fuera de alcance de este laboratorio</h3>
        <p className="desc">
          Si más adelante se integra el SDK, iría en un cliente nativo o un bridge, no en estas cookies
          de Vercel.
        </p>
      </section>
    </>
  );
}
