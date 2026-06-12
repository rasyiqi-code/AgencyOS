<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:html="http://www.w3.org/TR/REC-html40"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
	<xsl:template match="/">
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<title>XML Sitemap - Crediblemark</title>
				<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
				<style type="text/css">
					body {
						font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
						color: #333;
						margin: 0;
						padding: 40px;
						background: #f8f9fa;
					}
					.container {
						max-width: 1000px;
						margin: 0 auto;
						background: #fff;
						padding: 40px;
						border-radius: 12px;
						box-shadow: 0 4px 6px rgba(0,0,0,0.05);
					}
					h1 {
						color: #1a1a1a;
						font-size: 24px;
						margin-bottom: 10px;
					}
					p {
						color: #666;
						margin-bottom: 30px;
						font-size: 14px;
					}
					table {
						width: 100%;
						border-collapse: collapse;
						margin-top: 20px;
					}
					th {
						text-align: left;
						padding: 12px 15px;
						background: #f1f3f5;
						font-size: 13px;
						text-transform: uppercase;
						letter-spacing: 0.05em;
						color: #495057;
						border-bottom: 2px solid #dee2e6;
					}
					td {
						padding: 12px 15px;
						border-bottom: 1px solid #eee;
						font-size: 14px;
						word-break: break-all;
					}
					tr:hover td {
						background: #fdfdfe;
					}
					a {
						color: #228be6;
						text-decoration: none;
					}
					a:hover {
						text-decoration: underline;
					}
					.priority {
						display: inline-block;
						padding: 2px 8px;
						border-radius: 4px;
						background: #e7f5ff;
						color: #1971c2;
						font-weight: 600;
						font-size: 12px;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<h1>XML Sitemap</h1>
					<p>This is a generated XML Sitemap, meant for consumption by search engines. You can find more information about XML sitemaps on <a href="http://sitemaps.org">sitemaps.org</a>.</p>
					<table>
						<thead>
							<tr>
								<th>URL</th>
								<th>Priority</th>
								<th>Change Freq.</th>
								<th>Last Modified</th>
							</tr>
						</thead>
						<tbody>
							<xsl:for-each select="sitemap:urlset/sitemap:url">
								<tr>
									<td>
										<xsl:variable name="itemURL">
											<xsl:value-of select="sitemap:loc"/>
										</xsl:variable>
										<a href="{$itemURL}">
											<xsl:value-of select="sitemap:loc"/>
										</a>
									</td>
									<td>
										<span class="priority">
											<xsl:value-of select="sitemap:priority"/>
										</span>
									</td>
									<td>
										<xsl:value-of select="sitemap:changefreq"/>
									</td>
									<td>
										<xsl:value-of select="sitemap:lastmod"/>
									</td>
								</tr>
							</xsl:for-each>
						</tbody>
					</table>
				</div>
			</body>
		</html>
	</xsl:template>
</xsl:stylesheet>
